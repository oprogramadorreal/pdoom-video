// Every built block, by id. Blocks missing here render as placeholders (placeholder.ts).
import type { BlockFactory } from './block';
import { C00 } from './c00';

export const BLOCKS: Record<string, BlockFactory> = { ...C00 };
