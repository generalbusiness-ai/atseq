import { ApiError, type AtseqClient } from '../client/api.ts';
export function hostMessage(error: unknown): string {
  if (error instanceof ApiError && error.code === 'host_token')
    return 'Host access required. Enter the operator token using Host access to preview, start or stage an app. Participant actions need only your signing identity.';
  if (error instanceof ApiError && error.code === 'append_limit')
    return 'This app has reached this host’s entry limit. Existing history remains readable. Keep your signed action; it has not been appended.';
  if (error instanceof ApiError && ['snapshot_limit', 'definition_history_limit'].includes(error.code))
    return `Host limit reached (${error.code}). This host cannot serve this complete prefix. Keep your saved state and use a retained archive or another host.`;
  return error instanceof Error ? error.message : 'Host work is unavailable';
}
/** Operator access stays in the current tab; participant signatures need no token. */
export function installHostAccess(api: AtseqClient) {
  const dialog = document.querySelector<HTMLDialogElement>('#host-access-dialog')!,
    form = document.querySelector<HTMLFormElement>('#host-access-form')!,
    input = form.querySelector<HTMLInputElement>('input')!,
    status = document.querySelector<HTMLElement>('#status')!;
  document.querySelector<HTMLButtonElement>('#host-access')!.onclick = () => {
    dialog.showModal();
    input.focus();
  };
  document.querySelector<HTMLButtonElement>('#host-access-cancel')!.onclick = () => {
    input.value = '';
    dialog.close();
  };
  form.onsubmit = (event) => {
    event.preventDefault();
    const token = input.value.trim();
    if (!/^[A-Za-z0-9_-]{43,128}$/.test(token)) {
      input.setCustomValidity('Enter the host operator token');
      input.reportValidity();
      return;
    }
    input.setCustomValidity('');
    api.setHostToken(token);
    sessionStorage.setItem('atseq.host-token', token);
    input.value = '';
    dialog.close();
    status.textContent = 'Host access saved for this tab. Retry the operator action.';
  };
  input.oninput = () => input.setCustomValidity('');
  dialog.oncancel = () => {
    input.value = '';
  };
}
