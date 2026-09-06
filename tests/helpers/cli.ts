import { spawn } from 'node:child_process';
export async function cli(input: unknown): Promise<any> {
  const child = spawn(process.execPath, ['--import', 'tsx', 'src/cli/main.ts'], { stdio: ['pipe', 'pipe', 'pipe'] });
  let output = '', error = '';
  child.stdout.on('data', b => { output += b; }); child.stderr.on('data', b => { error += b; });
  child.stdin.end(JSON.stringify(input));
  const code = await new Promise<number | null>((resolve, reject) => { child.on('error', reject); child.on('exit', resolve); });
  let response; try { response = JSON.parse(output); } catch { throw new Error(`CLI returned no JSON: ${error.slice(0, 500)}`); }
  if (code !== 0 || !response.ok) throw new Error(response.error ?? error); return response.result;
}
