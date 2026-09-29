// Every built block, by id. Blocks missing here render as placeholders (placeholder.ts).
import type { BlockFactory } from './block';
import { C00 } from './c00';
import { C00B } from './c00b';
import { C01 } from './c01';
import { C02 } from './c02';
import { C02B } from './c02b';
import { C03 } from './c03';
import { C04 } from './c04';
import { C05 } from './c05';
import { C06 } from './c06';

export const BLOCKS: Record<string, BlockFactory> = { ...C00, ...C00B, ...C01, ...C02, ...C02B, ...C03, ...C04, ...C05, ...C06 };
