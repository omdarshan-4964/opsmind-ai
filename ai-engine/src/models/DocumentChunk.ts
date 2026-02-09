import mongoose, { Document, Schema } from 'mongoose';

export interface IDocumentChunk extends Document {
    content: string;
    metadata: {
        sourceFile: string;
        pageNumber: number;
    };
    vectorEmbedding: number[];
    createdAt: Date;
}

const DocumentChunkSchema: Schema = new Schema({
    content: {
        type: String,
        required: true,
    },
    metadata: {
        sourceFile: {
            type: String,
            required: true,
        },
        pageNumber: {
            type: Number,
            required: true,
        },
    },
    vectorEmbedding: {
        type: [Number],
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

// Handling model compilation check to prevent hot-reload errors
export const DocumentChunkModel =
    mongoose.models.DocumentChunk ||
    mongoose.model<IDocumentChunk>('DocumentChunk', DocumentChunkSchema);
