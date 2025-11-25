// Fallback declaration for sanitize-html if @types/sanitize-html is not installed
declare module 'sanitize-html' {
  export interface IOptions {
    allowedTags?: string[];
    allowedAttributes?: { [key: string]: string[] };
    transformTags?: Record<string, (tagName: string, attribs: any) => { tagName: string; attribs: any }>;
    allowedSchemesByTag?: { [key: string]: string[] };
    [key: string]: any;
  }
  function sanitize(html: string, options?: IOptions): string;
  export default sanitize;
}
