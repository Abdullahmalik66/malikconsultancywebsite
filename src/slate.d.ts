import { BaseEditor } from 'slate';
import { ReactEditor } from 'slate-react';
import { HistoryEditor } from 'slate-history';

export type CustomText = { 
  text: string;
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
};

export type ParagraphElement = { type: 'paragraph'; children: CustomText[] };
export type HeadingOneElement = { type: 'heading-one'; children: CustomText[] };
export type HeadingTwoElement = { type: 'heading-two'; children: CustomText[] };
export type BlockQuoteElement = { type: 'block-quote'; children: CustomText[] };
export type BulletedListElement = { type: 'bulleted-list'; children: CustomElement[] };
export type NumberedListElement = { type: 'numbered-list'; children: CustomElement[] };
export type ListItemElement = { type: 'list-item'; children: CustomElement[] };
export type ImageElement = { type: 'image'; url: string; children: CustomText[] };
export type LinkElement = { type: 'link'; url: string; children: CustomText[] };

export type CustomElement =
  | ParagraphElement
  | HeadingOneElement
  | HeadingTwoElement
  | BlockQuoteElement
  | BulletedListElement
  | NumberedListElement
  | ListItemElement
  | ImageElement
  | LinkElement;

declare module 'slate' {
  interface CustomTypes {
    Editor: BaseEditor & ReactEditor & HistoryEditor;
    Element: CustomElement;
    Text: CustomText;
  }
}
