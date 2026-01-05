/* eslint-disable @typescript-eslint/no-explicit-any */
declare module '@toast-ui/editor' {
    export interface EditorOptions {
        el: HTMLElement;
        height?: string;
        initialEditType?: 'markdown' | 'wysiwyg';
        previewStyle?: 'vertical' | 'tab';
        initialValue?: string;
        theme?: string;
        usageStatistics?: boolean;
        toolbarItems?: any[];
        events?: Record<string, (...args: any[]) => void>;
        [key: string]: any;
    }

    export default class Editor {
        constructor(options: EditorOptions);
        getMarkdown(): string;
        setMarkdown(markdown: string): void;
        getHTML(): string;
        destroy(): void;
        on(event: string, callback: (...args: any[]) => void): void;
        off(event: string): void;
    }
}
