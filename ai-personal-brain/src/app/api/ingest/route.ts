import { NextRequest, NextResponse } from 'next/server';
import { Pinecone } from '@pinecone-database/pinecone';
import { OpenAIEmbeddings } from '@langchain/openai';
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { PineconeStore } from '@langchain/pinecone';
import { createClientForRouteHandler } from '@/utils/supabase/server';

export async function POST(req: NextRequest) {
  try {
    console.log('Ingest API called')
    console.log('Cookies received:', {
      hasCookies: req.cookies.getAll().length > 0,
      cookieNames: req.cookies.getAll().map(c => c.name)
    })
    
    const supabase = createClientForRouteHandler(req);
    
    // Get authenticated user from session
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    console.log('Auth check:', { 
      hasUser: !!user, 
      userId: user?.id,
      authError: authError?.message 
    })
    
    if (authError || !user) {
      console.error('Authentication failed:', authError)
      return NextResponse.json({ 
        error: 'Unauthorized', 
        details: authError?.message || 'No user found' 
      }, { status: 401 });
    }

    const body = await req.json();
    const { content, metadata } = body;
    const userId = user.id; // Use authenticated user ID
    
    console.log('Processing ingest:', { 
      contentLength: content?.length,
      hasMetadata: !!metadata,
      userId 
    })
    
    if (!content || content.trim().length === 0) {
      return NextResponse.json({ error: 'Content cannot be empty' }, { status: 400 });
    }

    // 1. Save to Supabase for the UI/Dashboard (always save, even if short)
    const { data: note, error } = await supabase
      .from('memories')
      .insert([{ content, user_id: userId, metadata: metadata || {} }])
      .select()
      .single();

    if (error) {
      console.error("Supabase insert error:", error);
      return NextResponse.json({ 
        error: 'Database error', 
        details: error.message,
        code: error.code 
      }, { status: 500 });
    }
    
    console.log('Note saved to Supabase:', note.id)

    // If the note is too short, just save to Supabase but SKIP Pinecone
    // This keeps your AI "Brain" from getting confused by empty memories
    if (content.trim().length < 3) {
      return NextResponse.json({ 
        success: true, 
        noteId: note.id,
        message: "Note too short for AI memory, saved to DB only" 
      });
    }

    // 2. Check if Pinecone is configured (optional - can work without it)
    const pineconeApiKey = process.env.PINECONE_API_KEY;
    const pineconeIndexName = process.env.PINECONE_INDEX_NAME;
    const openrouterApiKey = process.env.OPENROUTER_API_KEY;

    if (!pineconeApiKey || !pineconeIndexName || !openrouterApiKey) {
      console.warn('Pinecone/OpenRouter not configured - saving to Supabase only');
      return NextResponse.json({ 
        success: true, 
        noteId: note.id,
        message: "Note saved to database. Vector storage not configured - add PINECONE_API_KEY, PINECONE_INDEX_NAME, and OPENROUTER_API_KEY to enable AI search.",
        warning: "Pinecone not configured"
      });
    }

    // 3. Prepare for Vector Storage (only if configured)
    try {
      const pc = new Pinecone({ apiKey: pineconeApiKey });
      const index = pc.Index(pineconeIndexName);

      const splitter = new RecursiveCharacterTextSplitter({
        chunkSize: 1000,
        chunkOverlap: 200,
      });

      // Create chunks and add the Supabase Note ID to metadata for linking
      const docs = await splitter.createDocuments([content], [{ 
        ...metadata, 
        noteId: note.id,
        userId: userId 
      }]);

      // 4. Embed & Store in Pinecone
      const embeddings = new OpenAIEmbeddings({
        openAIApiKey: openrouterApiKey,
        configuration: { baseURL: "https://openrouter.ai/api/v1" }
      });

      await PineconeStore.fromDocuments(docs, embeddings, {
        pineconeIndex: index,
        namespace: userId, // Multitenancy: keeps user's brains separate
      });

      console.log('Note saved to both Supabase and Pinecone');
      return NextResponse.json({ 
        success: true, 
        noteId: note.id,
        message: "Note saved to database and AI memory"
      });
    } catch (pineconeError: any) {
      console.error("Pinecone error (but note saved to Supabase):", pineconeError);
      // Still return success since Supabase save worked
      return NextResponse.json({ 
        success: true, 
        noteId: note.id,
        message: "Note saved to database. Vector storage failed - check Pinecone configuration.",
        warning: pineconeError.message
      });
    }
  } catch (error: any) {
    console.error("Ingest Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}