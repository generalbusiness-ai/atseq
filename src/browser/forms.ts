import { resolveSchema, type DefinitionInfo } from '../client/definition.ts';
import type { Json } from '../runtime/values.ts';

export function element<K extends keyof HTMLElementTagNameMap>(tag: K, text?: string, className?: string): HTMLElementTagNameMap[K] {
  const node = document.createElement(tag); if (text !== undefined) node.textContent = text; if (className) node.className = className; return node;
}
export function button(label: string, action: () => void | Promise<void>, className?: string) {
  const node = element('button', label, className); node.type = 'button'; node.onclick = () => { void action(); }; return node;
}
/** Scalars use labeled controls; nested objects/arrays/unions use validated JSON. */
export function schemaForm(info: DefinitionInfo, schema: any, submitLabel: string, submit: (value: Record<string, Json>) => Promise<void>, initial: Record<string, Json> = {}) {
  const form = element('form'), fields: (() => [string, Json] | undefined)[] = [];
  for (const [name, property] of Object.entries(schema.properties ?? {}) as [string, any][]) {
    const label = element('label', property.description ?? name), required = schema.required?.includes(name) ?? false;
    let control: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;
    if (property.type === 'string' && property.enum) {
      const select = element('select'); select.append(element('option', ''));
      for (const value of property.enum) { const option = element('option', value); option.value = value; select.append(option); } control = select;
    } else if (property.type === 'boolean') { control = element('select'); for (const [value, text] of [['', 'Choose…'], ['true', 'Yes'], ['false', 'No']]) { const option = element('option', text); option.value = value!; control.append(option); } }
    else if (['string', 'integer'].includes(property.type)) { const field = element('input'); field.type = property.type === 'integer' ? 'number' : 'text'; if (property.type === 'integer') { field.step = '1'; if (property.minimum !== undefined) field.min = String(property.minimum); if (property.maximum !== undefined) field.max = String(property.maximum); } else { if (property.minLength !== undefined) field.minLength = property.minLength; if (property.maxLength !== undefined) field.maxLength = property.maxLength; } control = field; }
    else { control = element('textarea'); control.rows = 4; label.append(element('small', ' Enter JSON matching the declared schema.')); }
    control.name = name; control.required = required; control.setAttribute('aria-label', property.description ?? name);
    if (initial[name] !== undefined) control.value = typeof initial[name] === 'string' ? initial[name] as string : JSON.stringify(initial[name]);
    label.append(control); form.append(label);
    fields.push(() => {
      if (control.value === '' && !required) return undefined;
      const value = property.type === 'string' ? control.value : property.type === 'integer' ? Number(control.value) : JSON.parse(control.value);
      return [name, value];
    });
  }
  const error = element('p', '', 'error'); error.setAttribute('role', 'alert');
  const save = element('button', submitLabel, 'primary'); save.type = 'submit';
  form.append(error, save);
  form.onsubmit = async event => {
    event.preventDefault(); if (save.disabled) return; save.disabled = true; error.textContent = '';
    try { await submit(Object.fromEntries(fields.map(read => read()).filter(Boolean) as [string, Json][])); }
    catch (e) { error.textContent = (e as Error).message; }
    finally { save.disabled = false; }
  };
  return form;
}
export function actionForm(info: DefinitionInfo, ref: string, submitLabel: string, submit: (value: Record<string, Json>) => Promise<void>, initial?: Record<string, Json>) {
  return schemaForm(info, resolveSchema(info, ref), submitLabel, submit, initial);
}
