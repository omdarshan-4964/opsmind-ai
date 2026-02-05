/**
 * Shared Types for OpsMind AI Engine
 * 
 * IMPORTANT: This file is shared with the Backend team.
 * Any changes here must be communicated to maintain API compatibility.
 */

/**
 * Represents a single chat message in the conversation history
 */
export interface ChatMessage {
    role: 'user' | 'assistant' | 'system';
    content: string;
    timestamp?: string;
    metadata?: Record<string, any>;
}

/**
 * Represents a tool/function call made by the agent
 */
export interface ToolCall {
    toolName: string;
    arguments: Record<string, any>;
    result?: any;
    timestamp?: string;
}

/**
 * Response structure from the Agentic AI Engine
 */
export interface AgentResponse {
    answer: string;
    sources?: Array<{
        content: string;
        score: number;
        metadata?: Record<string, any>;
    }>;
    toolsCalled?: ToolCall[];
    conversationContext?: {
        messageCount: number;
        hasHistory: boolean;
    };
    metadata?: {
        model: string;
        embeddingModel: string;
        processingTime?: number;
        fallbackMode?: boolean;
    };
}

/**
 * Request structure for the Agentic AI Engine
 */
export interface AgentRequest {
    question: string;
    history?: ChatMessage[];
    userId?: string;
    sessionId?: string;
}
