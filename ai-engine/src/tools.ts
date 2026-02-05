/**
 * Tool Definitions for Agentic AI
 * 
 * This file contains function definitions that the AI agent can call
 * to perform actions or retrieve additional information.
 */

import { ToolCall } from './types';

/**
 * Mock function to check leave balance for an employee
 * 
 * In production, this would query your HR system/database
 * 
 * @param userId - The user ID to check balance for
 * @returns Leave balance information
 */
export async function checkLeaveBalance(userId: string): Promise<{
    sickLeave: number;
    vacationLeave: number;
    personalLeave: number;
    totalUsed: number;
}> {
    // MOCK DATA - Replace with actual DB/API call in production
    console.log(`🔧 Tool Called: checkLeaveBalance for user: ${userId}`);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Mock data based on user
    const mockBalances: Record<string, any> = {
        'default': { sickLeave: 10, vacationLeave: 15, personalLeave: 5, totalUsed: 25 },
        'user123': { sickLeave: 8, vacationLeave: 12, personalLeave: 3, totalUsed: 32 },
        'user456': { sickLeave: 15, vacationLeave: 20, personalLeave: 7, totalUsed: 13 },
    };
    
    return mockBalances[userId] || mockBalances['default'];
}

/**
 * Registry of available tools
 * Maps tool names to their implementations
 */
export const AVAILABLE_TOOLS: Record<string, Function> = {
    checkLeaveBalance,
};

/**
 * Tool metadata for AI to understand what tools are available
 */
export const TOOL_DEFINITIONS = [
    {
        name: 'checkLeaveBalance',
        description: 'Checks the leave balance (sick, vacation, personal) for a specific user',
        parameters: {
            userId: {
                type: 'string',
                description: 'The user ID to check balance for',
                required: true,
            },
        },
    },
];

/**
 * Execute a tool call and return the result
 * 
 * @param toolCall - The tool call to execute
 * @returns The result of the tool execution
 */
export async function executeTool(toolCall: ToolCall): Promise<any> {
    const tool = AVAILABLE_TOOLS[toolCall.toolName];
    
    if (!tool) {
        throw new Error(`Tool '${toolCall.toolName}' not found`);
    }
    
    try {
        const result = await tool(...Object.values(toolCall.arguments));
        return result;
    } catch (error) {
        console.error(`Error executing tool '${toolCall.toolName}':`, error);
        throw error;
    }
}
