import { BaseEditor } from 'slate';
import { ReactEditor } from 'slate-react';
import { HistoryEditor } from 'slate-history';

export type CustomText = { 
  text: string;
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  code?: boolean;
  superscript?: boolean;
  subscript?: boolean;
  color?: string;
  fontSize?: string;
};

export type BaseBlockElement = {
  align?: 'left' | 'center' | 'right' | 'justify';
};

export type ParagraphElement = { type: 'paragraph'; children: (CustomText | LinkElement)[] } & BaseBlockElement;
export type HeadingOneElement = { type: 'heading-one'; children: CustomText[] } & BaseBlockElement;
export type HeadingTwoElement = { type: 'heading-two'; children: CustomText[] } & BaseBlockElement;
export type HeadingThreeElement = { type: 'heading-three'; children: CustomText[] } & BaseBlockElement;
export type HeadingFourElement = { type: 'heading-four'; children: CustomText[] } & BaseBlockElement;
export type BlockQuoteElement = { type: 'block-quote'; children: CustomText[] } & BaseBlockElement;
export type BulletedListElement = { type: 'bulleted-list'; children: CustomElement[] };
export type NumberedListElement = { type: 'numbered-list'; children: CustomElement[] };
export type ListItemElement = { type: 'list-item'; children: CustomElement[] };
export type ImageElement = { type: 'image'; url: string; children: CustomText[] };
export type LinkElement = { type: 'link'; url: string; children: CustomText[] };
export type CodeBlockElement = { type: 'code-block'; children: CustomText[] };

export type TableElement = { type: 'table'; children: TableRowElement[] };
export type TableRowElement = { type: 'table-row'; children: TableCellElement[] };
export type TableCellElement = { type: 'table-cell'; children: CustomElement[] };

export type CustomElement =
  | ParagraphElement
  | HeadingOneElement
  | HeadingTwoElement
  | HeadingThreeElement
  | HeadingFourElement
  | BlockQuoteElement
  | BulletedListElement
  | NumberedListElement
  | ListItemElement
  | ImageElement
  | LinkElement
  | CodeBlockElement
  | TableElement
  | TableRowElement
  | TableCellElement;

declare module 'slate' {
  interface CustomTypes {
    Editor: BaseEditor & ReactEditor & HistoryEditor;
    Element: CustomElement;
    Text: CustomText;
  }
}
