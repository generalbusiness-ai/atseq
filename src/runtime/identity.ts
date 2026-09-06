import descriptor from './application-profile.json';
import { contentCid } from '../protocol/wire.ts';

/** S3 application behavior extends the immutable S0 engine profile. */
export const applicationRuntimeDescriptor = descriptor;
export const applicationRuntimeCid = () => contentCid(descriptor);
