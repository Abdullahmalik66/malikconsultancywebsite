import React, { useCallback, useMemo, useState, useRef, useEffect } from 'react';
import { createEditor, Descendant, Editor, Element as SlateElement, Transforms } from 'slate';
import { Slate, Editable, withReact, useSlate } from 'slate-react';
import { withHistory } from 'slate-history';
import isHotkey from 'is-hotkey';
import escapeHtml from 'escape-html';
import { Bold, Italic, Underline as UnderlineIcon, Heading1, Heading2, List, ListOrdered, Quote, Image as ImageIcon } from 'lucide-react';
import { CustomElement, CustomText } from '../../slate';
import { uploadImage } from '../../lib/firebase/cms';

const HOTKEYS: Record<string, string> = {
  'mod+b': 'bold',
  'mod+i': 'italic',
  'mod+u': 'underline',
};

const LIST_TYPES = ['numbered-list', 'bulleted-list'];

// --- Deserializer ---
export const deserialize = (el: HTMLElement | ChildNode): any => {
  if (el.nodeType === 3) {
    return { text: el.textContent || '' };
  } else if (el.nodeType !== 1) {
    return null;
  }

  const nodeName = el.nodeName;
  const parent = el as HTMLElement;

  let children: any[] = Array.from(parent.childNodes)
    .map(deserialize)
    .flat()
    .filter((n) => n !== null);

  if (children.length === 0) {
    children = [{ text: '' }];
  }

  switch (nodeName) {
    case 'BODY':
      return children;
    case 'BR':
      return { text: '\n' };
    case 'BLOCKQUOTE':
      return { type: 'block-quote', children };
    case 'P':
      return { type: 'paragraph', children };
    case 'H1':
      return { type: 'heading-one', children };
    case 'H2':
      return { type: 'heading-two', children };
    case 'UL':
      return { type: 'bulleted-list', children };
    case 'OL':
      return { type: 'numbered-list', children };
    case 'LI':
      return { type: 'list-item', children };
    case 'IMG':
      return { type: 'image', url: parent.getAttribute('src'), children: [{ text: '' }] };
    case 'STRONG':
    case 'B':
      return children.map((child: any) => ({ ...child, bold: true }));
    case 'EM':
    case 'I':
      return children.map((child: any) => ({ ...child, italic: true }));
    case 'U':
      return children.map((child: any) => ({ ...child, underline: true }));
    default:
      return children;
  }
};

const deserializeHtml = (html: string) => {
    if (!html) return [{ type: 'paragraph', children: [{ text: '' }] }];
    const document = new DOMParser().parseFromString(html, 'text/html');
    const parsed = deserialize(document.body);
    
    if (Array.isArray(parsed) && parsed.length > 0) {
        const blocks: any[] = [];
        let currentParagraph: any[] = [];
        
        const blockTypes = ['paragraph', 'heading-one', 'heading-two', 'block-quote', 'bulleted-list', 'numbered-list', 'image'];

        parsed.forEach((node: any) => {
           if (node.type && blockTypes.includes(node.type)) {
               if (currentParagraph.length > 0) {
                   // Ensure paragraph has valid children
                   const pChildren = currentParagraph.filter(c => c.text !== undefined || c.type);
                   if (pChildren.length > 0) {
                       blocks.push({ type: 'paragraph', children: pChildren });
                   }
                   currentParagraph = [];
               }
               blocks.push(node);
           } else {
               currentParagraph.push(node);
           }
        });
        
        if (currentParagraph.length > 0) {
           const pChildren = currentParagraph.filter(c => c.text !== undefined || c.type);
           if (pChildren.length > 0) {
               blocks.push({ type: 'paragraph', children: pChildren });
           }
        }
        
        if (blocks.length > 0) return blocks;
    }
    return [{ type: 'paragraph', children: [{ text: '' }] }];
}

// --- Serializer ---
export const serialize = (node: any): string => {
  if (Editor.isEditor(node)) {
      return node.children.map(n => serialize(n)).join('');
  }

  if (node.text !== undefined) {
    let string = escapeHtml(node.text);
    if (node.bold) string = `<strong>${string}</strong>`;
    if (node.italic) string = `<em>${string}</em>`;
    if (node.underline) string = `<u>${string}</u>`;
    return string;
  }

  const children = node.children.map((n: any) => serialize(n)).join('');

  switch (node.type) {
    case 'block-quote':
      return `<blockquote>${children}</blockquote>`;
    case 'paragraph':
      return `<p>${children}</p>`;
    case 'heading-one':
      return `<h1>${children}</h1>`;
    case 'heading-two':
      return `<h2>${children}</h2>`;
    case 'bulleted-list':
      return `<ul>${children}</ul>`;
    case 'numbered-list':
      return `<ol>${children}</ol>`;
    case 'list-item':
      return `<li>${children}</li>`;
    case 'image':
      return `<img src="${escapeHtml(node.url)}" alt="image" />`;
    case 'link':
      return `<a href="${escapeHtml(node.url)}">${children}</a>`;
    default:
      return children;
  }
};


// --- Plugins ---
const withImages = (editor: any) => {
  const { insertData, isVoid } = editor;

  editor.isVoid = (element: any) => {
    return element.type === 'image' ? true : isVoid(element);
  };

  editor.insertData = (data: any) => {
    const text = data.getData('text/plain');
    const { files } = data;

    if (files && files.length > 0) {
      // Normally we'd handle pasted files here
    } else {
      insertData(data);
    }
  };

  return editor;
};

// --- Editor Component ---
interface SlateEditorProps {
    initialHtml: string;
    onChangeHtml: (html: string) => void;
}

export default function SlateEditor({ initialHtml, onChangeHtml }: SlateEditorProps) {
    const renderElement = useCallback((props: any) => <Element {...props} />, []);
    const renderLeaf = useCallback((props: any) => <Leaf {...props} />, []);
    const editor = useMemo(() => withImages(withHistory(withReact(createEditor()))), []);

    const [value, setValue] = useState<Descendant[]>(deserializeHtml(initialHtml));

    // Handle updates
    const handleChange = (newValue: Descendant[]) => {
        setValue(newValue);
        const isAstChange = editor.operations.some(
          op => 'set_selection' !== op.type
        );
        if (isAstChange) {
            const html = newValue.map(n => serialize(n)).join('');
            onChangeHtml(html);
        }
    };

    return (
        <div className="border border-m3-outline/20 rounded-[32px] overflow-hidden bg-m3-surface">
            <Slate editor={editor} initialValue={value} onChange={handleChange}>
                <Toolbar />
                <div className="p-6 min-h-[300px]">
                    <Editable
                        renderElement={renderElement}
                        renderLeaf={renderLeaf}
                        placeholder="Start writing..."
                        spellCheck
                        autoFocus
                        onKeyDown={event => {
                            for (const hotkey in HOTKEYS) {
                                if (isHotkey(hotkey, event as any)) {
                                    event.preventDefault();
                                    const mark = HOTKEYS[hotkey];
                                    toggleMark(editor, mark);
                                }
                            }
                        }}
                    />
                </div>
            </Slate>
        </div>
    );
}

// --- Toolbar ---
const Toolbar = () => {
    const editor = useSlate();
    return (
        <div className="flex flex-wrap items-center gap-1 p-3 border-b border-m3-outline/20 bg-m3-surface-container-low">
            <MarkButton format="bold" icon={<Bold className="w-4 h-4" />} />
            <MarkButton format="italic" icon={<Italic className="w-4 h-4" />} />
            <MarkButton format="underline" icon={<UnderlineIcon className="w-4 h-4" />} />
            <div className="w-px h-6 bg-m3-outline/20 mx-2" />
            <BlockButton format="heading-one" icon={<Heading1 className="w-4 h-4" />} />
            <BlockButton format="heading-two" icon={<Heading2 className="w-4 h-4" />} />
            <BlockButton format="block-quote" icon={<Quote className="w-4 h-4" />} />
            <div className="w-px h-6 bg-m3-outline/20 mx-2" />
            <BlockButton format="numbered-list" icon={<ListOrdered className="w-4 h-4" />} />
            <BlockButton format="bulleted-list" icon={<List className="w-4 h-4" />} />
            <div className="w-px h-6 bg-m3-outline/20 mx-2" />
            <ImageUploadButton />
        </div>
    );
}

const ImageUploadButton = () => {
    const editor = useSlate();
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        try {
            const url = await uploadImage(file, 'content-inline');
            const image = { type: 'image', url, children: [{ text: '' }] } as any;
            Transforms.insertNodes(editor, image);
            Transforms.insertNodes(editor, { type: 'paragraph', children: [{ text: '' }] } as any);
        } catch (error) {
            console.error('Image upload failed', error);
        } finally {
            setIsUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    return (
        <>
            <button
              onMouseDown={event => {
                event.preventDefault();
                fileInputRef.current?.click();
              }}
              disabled={isUploading}
              className={`p-2 rounded-xl transition-colors text-m3-on-surface/60 hover:bg-m3-surface-container-high ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <ImageIcon className={`w-4 h-4 ${isUploading ? 'animate-pulse text-m3-primary' : ''}`} />
            </button>
            <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleUpload} />
        </>
    );
};

// --- Toolbar Buttons ---
const toggleBlock = (editor: any, format: string) => {
  const isActive = isBlockActive(editor, format);
  const isList = LIST_TYPES.includes(format);

  Transforms.unwrapNodes(editor, {
    match: n => !Editor.isEditor(n) && SlateElement.isElement(n) && LIST_TYPES.includes((n as any).type),
    split: true,
  });

  const newProperties: Partial<SlateElement> = {
    type: isActive ? 'paragraph' : isList ? 'list-item' : format,
  } as any;

  Transforms.setNodes(editor, newProperties);

  if (!isActive && isList) {
    const block = { type: format, children: [] } as any;
    Transforms.wrapNodes(editor, block);
  }
};

const toggleMark = (editor: any, format: string) => {
  const isActive = isMarkActive(editor, format);
  if (isActive) {
    Editor.removeMark(editor, format);
  } else {
    Editor.addMark(editor, format, true);
  }
};

const isBlockActive = (editor: any, format: string) => {
  const [match] = Editor.nodes(editor, {
    match: n => !Editor.isEditor(n) && SlateElement.isElement(n) && (n as any).type === format,
  });
  return !!match;
};

const isMarkActive = (editor: any, format: string) => {
  const marks = Editor.marks(editor);
  return marks ? (marks as any)[format] === true : false;
};

const BlockButton = ({ format, icon }: { format: string, icon: React.ReactNode }) => {
  const editor = useSlate();
  const active = isBlockActive(editor, format);
  return (
    <button
      onMouseDown={event => {
        event.preventDefault();
        toggleBlock(editor, format);
      }}
      className={`p-2 rounded-xl transition-colors ${active ? 'bg-m3-primary/10 text-m3-primary' : 'text-m3-on-surface/60 hover:bg-m3-surface-container-high'}`}
    >
      {icon}
    </button>
  );
};

const MarkButton = ({ format, icon }: { format: string, icon: React.ReactNode }) => {
  const editor = useSlate();
  const active = isMarkActive(editor, format);
  return (
    <button
      onMouseDown={event => {
        event.preventDefault();
        toggleMark(editor, format);
      }}
      className={`p-2 rounded-xl transition-colors ${active ? 'bg-m3-primary/10 text-m3-primary' : 'text-m3-on-surface/60 hover:bg-m3-surface-container-high'}`}
    >
      {icon}
    </button>
  );
};

// --- Element Renderers ---
const Element = ({ attributes, children, element }: any) => {
  switch (element.type) {
    case 'block-quote':
      return <blockquote {...attributes} className="border-l-4 border-m3-primary pl-4 italic my-4">{children}</blockquote>;
    case 'bulleted-list':
      return <ul {...attributes} className="list-disc ml-6 my-4">{children}</ul>;
    case 'heading-one':
      return <h1 {...attributes} className="text-4xl font-bold mt-8 mb-4">{children}</h1>;
    case 'heading-two':
      return <h2 {...attributes} className="text-2xl font-bold mt-6 mb-3">{children}</h2>;
    case 'list-item':
      return <li {...attributes}>{children}</li>;
    case 'numbered-list':
      return <ol {...attributes} className="list-decimal ml-6 my-4">{children}</ol>;
    case 'image':
      return (
          <div {...attributes} className="my-6">
              <div contentEditable={false}>
                  <img src={element.url} alt="" className="max-w-full rounded-2xl shadow-md block" />
              </div>
              {children}
          </div>
      );
    default:
      return <p {...attributes} className="mb-4 text-lg">{children}</p>;
  }
};

const Leaf = ({ attributes, children, leaf }: any) => {
  if (leaf.bold) {
    children = <strong>{children}</strong>;
  }
  if (leaf.italic) {
    children = <em>{children}</em>;
  }
  if (leaf.underline) {
    children = <u>{children}</u>;
  }
  return <span {...attributes}>{children}</span>;
};
