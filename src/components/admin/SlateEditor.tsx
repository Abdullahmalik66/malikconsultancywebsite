import React, { useCallback, useMemo, useState, useRef, useEffect } from 'react';
import { createEditor, Descendant, Editor, Element as SlateElement, Transforms, Range } from 'slate';
import { Slate, Editable, withReact, useSlate } from 'slate-react';
import { withHistory } from 'slate-history';
import isHotkey from 'is-hotkey';
import escapeHtml from 'escape-html';
import { 
  Bold, Italic, Underline as UnderlineIcon, Heading1, Heading2, 
  List, ListOrdered, Quote, Image as ImageIcon,
  AlignLeft, AlignCenter, AlignRight, AlignJustify,
  Code as CodeIcon, Terminal, Superscript, Subscript, Link as LinkIcon, Palette,
  Table as TableIcon, ChevronDown
} from 'lucide-react';
import { CustomElement, CustomText } from '../../slate';
import { uploadImage } from '../../lib/firebase/cms';

const HOTKEYS: Record<string, string> = {
  'mod+b': 'bold',
  'mod+i': 'italic',
  'mod+u': 'underline',
  'mod+`': 'code-block',
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

  const align = parent.style?.textAlign || parent.getAttribute('align') || undefined;
  const blockProps = align ? { align } : {};

  switch (nodeName) {
    case 'BODY': return children;
    case 'BR': return { text: '\\n' };
    case 'BLOCKQUOTE': return { type: 'block-quote', children, ...blockProps };
    case 'P': return { type: 'paragraph', children, ...blockProps };
    case 'H1': return { type: 'heading-one', children, ...blockProps };
    case 'H2': return { type: 'heading-two', children, ...blockProps };
    case 'H3': return { type: 'heading-three', children, ...blockProps };
    case 'H4': return { type: 'heading-four', children, ...blockProps };
    case 'PRE': return { type: 'code-block', children, ...blockProps };
    case 'UL': return { type: 'bulleted-list', children };
    case 'OL': return { type: 'numbered-list', children };
    case 'LI': return { type: 'list-item', children };
    case 'TABLE': return { type: 'table', children };
    case 'TBODY': return children;
    case 'TR': return { type: 'table-row', children };
    case 'TD':
    case 'TH': return { type: 'table-cell', children };
    case 'IMG': return { type: 'image', url: parent.getAttribute('src'), children: [{ text: '' }] };
    case 'A': return { type: 'link', url: parent.getAttribute('href'), children };
    case 'STRONG':
    case 'B': return children.map((child: any) => ({ ...child, bold: true }));
    case 'EM':
    case 'I': return children.map((child: any) => ({ ...child, italic: true }));
    case 'U': return children.map((child: any) => ({ ...child, underline: true }));
    case 'CODE': return children.map((child: any) => ({ ...child, code: true }));
    case 'SUP': return children.map((child: any) => ({ ...child, superscript: true }));
    case 'SUB': return children.map((child: any) => ({ ...child, subscript: true }));
    case 'SPAN': 
      const color = parent.style?.color;
      const fontSize = parent.style?.fontSize;
      return children.map((child: any) => ({ 
        ...child, 
        ...(color ? { color } : {}),
        ...(fontSize ? { fontSize } : {})
      }));
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
        
        const blockTypes = ['paragraph', 'heading-one', 'heading-two', 'heading-three', 'heading-four', 'block-quote', 'bulleted-list', 'numbered-list', 'image', 'code-block', 'table', 'table-row', 'table-cell'];

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
    if (node.code) string = `<code>${string}</code>`;
    if (node.superscript) string = `<sup>${string}</sup>`;
    if (node.subscript) string = `<sub>${string}</sub>`;
    
    if (node.color || node.fontSize) {
      const colorStyle = node.color ? `color: ${node.color}; ` : '';
      const sizeStyle = node.fontSize ? `font-size: ${node.fontSize};` : '';
      string = `<span style="${colorStyle}${sizeStyle}">${string}</span>`;
    }
    return string;
  }

  const children = node.children.map((n: any) => serialize(n)).join('');
  const alignStyle = node.align ? ` style="text-align: ${node.align};"` : '';

  switch (node.type) {
    case 'block-quote': return `<blockquote${alignStyle}>${children}</blockquote>`;
    case 'paragraph': return `<p${alignStyle}>${children}</p>`;
    case 'heading-one': return `<h1${alignStyle}>${children}</h1>`;
    case 'heading-two': return `<h2${alignStyle}>${children}</h2>`;
    case 'heading-three': return `<h3${alignStyle}>${children}</h3>`;
    case 'heading-four': return `<h4${alignStyle}>${children}</h4>`;
    case 'code-block': return `<pre${alignStyle}><code>${children}</code></pre>`;
    case 'bulleted-list': return `<ul>${children}</ul>`;
    case 'numbered-list': return `<ol>${children}</ol>`;
    case 'list-item': return `<li>${children}</li>`;
    case 'table': return `<table class="w-full border-collapse border border-m3-outline/20 my-4"><tbody>${children}</tbody></table>`;
    case 'table-row': return `<tr class="border-b border-m3-outline/20">${children}</tr>`;
    case 'table-cell': return `<td class="p-3 border border-m3-outline/20 align-top">${children}</td>`;
    case 'image': return `<img src="${escapeHtml(node.url)}" alt="image" />`;
    case 'link': return `<a href="${escapeHtml(node.url)}" class="text-m3-primary underline" target="_blank" rel="noopener noreferrer">${children}</a>`;
    default: return children;
  }
};

// --- Plugins ---
const withCodeBlocks = (editor: any) => {
  const { insertBreak } = editor;

  editor.insertBreak = () => {
    const { selection } = editor;
    if (selection) {
      const [match] = Editor.nodes(editor, {
        match: n => !Editor.isEditor(n) && SlateElement.isElement(n) && (n as any).type === 'code-block'
      });

      if (match) {
        // Insert a literal newline instead of splitting the block
        editor.insertText('\n');
        return;
      }
    }
    insertBreak();
  };

  return editor;
};

const withLinks = (editor: any) => {
  const { isInline } = editor;
  editor.isInline = (element: any) => {
    return element.type === 'link' ? true : isInline(element);
  };
  return editor;
};

const withTables = (editor: any) => {
  const { deleteBackward, deleteForward, insertBreak } = editor;

  editor.deleteBackward = (unit: any) => {
    const { selection } = editor;
    if (selection && Range.isCollapsed(selection)) {
      const [cell] = Editor.nodes(editor, { match: n => !Editor.isEditor(n) && SlateElement.isElement(n) && (n as any).type === 'table-cell' });
      if (cell) {
        const [, cellPath] = cell;
        const start = Editor.start(editor, cellPath);
        if (Editor.isStart(editor, selection.anchor, cellPath)) {
          return;
        }
      }
    }
    deleteBackward(unit);
  };
  
  editor.deleteForward = (unit: any) => {
    const { selection } = editor;
    if (selection && Range.isCollapsed(selection)) {
      const [cell] = Editor.nodes(editor, { match: n => !Editor.isEditor(n) && SlateElement.isElement(n) && (n as any).type === 'table-cell' });
      if (cell) {
        const [, cellPath] = cell;
        if (Editor.isEnd(editor, selection.focus, cellPath)) {
          return;
        }
      }
    }
    deleteForward(unit);
  };

  editor.insertBreak = () => {
    const { selection } = editor;
    if (selection) {
      const [cell] = Editor.nodes(editor, { match: n => !Editor.isEditor(n) && SlateElement.isElement(n) && (n as any).type === 'table-cell' });
      if (cell) {
        return; // simple: no breaks in table cell
      }
    }
    insertBreak();
  };

  return editor;
};

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
    const editor = useMemo(() => withCodeBlocks(withTables(withLinks(withImages(withHistory(withReact(createEditor())))))), []);

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
        <div className="border border-m3-outline/20 rounded-[32px] bg-m3-surface">
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
                                    const format = HOTKEYS[hotkey];
                                    if (format === 'code-block') {
                                        toggleBlock(editor, 'code-block');
                                    } else {
                                        toggleMark(editor, format);
                                    }
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
        <div className="flex flex-wrap items-center gap-1 p-3 border-b border-m3-outline/20 bg-white dark:bg-[#1d1b20] sticky top-[88px] z-40 rounded-t-[32px]">
            <HeadingDropdown />
            <FontSizeSelect />
            <ColorPaletteDropdown />
            <div className="w-px h-6 bg-m3-outline/20 mx-1" />
            <MarkButton format="bold" icon={<Bold className="w-4 h-4" />} title="Bold (Ctrl+B)" />
            <MarkButton format="italic" icon={<Italic className="w-4 h-4" />} title="Italic (Ctrl+I)" />
            <MarkButton format="underline" icon={<UnderlineIcon className="w-4 h-4" />} title="Underline (Ctrl+U)" />
            <BlockButton format="code-block" icon={<CodeIcon className="w-4 h-4" />} title="Code Block (Ctrl+`)" />
            <MarkButton format="superscript" icon={<Superscript className="w-4 h-4" />} title="Superscript" />
            <MarkButton format="subscript" icon={<Subscript className="w-4 h-4" />} title="Subscript" />
            <div className="w-px h-6 bg-m3-outline/20 mx-1" />
            <AlignButton align="left" icon={<AlignLeft className="w-4 h-4" />} />
            <AlignButton align="center" icon={<AlignCenter className="w-4 h-4" />} />
            <AlignButton align="right" icon={<AlignRight className="w-4 h-4" />} />
            <AlignButton align="justify" icon={<AlignJustify className="w-4 h-4" />} />
            <div className="w-px h-6 bg-m3-outline/20 mx-1" />
            <BlockButton format="numbered-list" icon={<ListOrdered className="w-4 h-4" />} title="Numbered List" />
            <BlockButton format="bulleted-list" icon={<List className="w-4 h-4" />} title="Bulleted List" />
            <BlockButton format="block-quote" icon={<Quote className="w-4 h-4" />} title="Block Quote" />
            <div className="w-px h-6 bg-m3-outline/20 mx-1" />
            <LinkButton />
            <TableDropdown />
            <ImageUploadButton />
        </div>
    );
}

const isInlineActive = (editor: any, format: string) => {
  const [match] = Editor.nodes(editor, { match: n => !Editor.isEditor(n) && SlateElement.isElement(n) && (n as any).type === format });
  return !!match;
};

const LinkButton = () => {
  const editor = useSlate();
  const isActive = isInlineActive(editor, 'link');

  return (
    <button
      onMouseDown={event => {
        event.preventDefault();
        if (isActive) {
          Transforms.unwrapNodes(editor, { match: n => !Editor.isEditor(n) && SlateElement.isElement(n) && (n as any).type === 'link' });
        } else {
          const url = window.prompt('Enter the URL of the link:');
          if (!url) return;
          if (editor.selection) {
            Transforms.wrapNodes(editor, { type: 'link', url, children: [] } as any, { split: true });
            Transforms.collapse(editor, { edge: 'end' });
          }
        }
      }}
      className={`p-2 rounded-xl transition-colors ${isActive ? 'bg-m3-primary/10 text-m3-primary' : 'text-m3-on-surface/60 hover:bg-m3-surface-container-high'}`}
      title="Link"
    >
      <LinkIcon className="w-4 h-4" />
    </button>
  );
};

const toggleAlign = (editor: any, align: string) => {
  Transforms.setNodes(editor, { align } as any, { match: n => !Editor.isEditor(n) && SlateElement.isElement(n) && Editor.isBlock(editor, n) });
};

const AlignButton = ({ align, icon }: { align: string, icon: React.ReactNode }) => {
  const editor = useSlate();
  const [match] = Editor.nodes(editor, { match: n => !Editor.isEditor(n) && SlateElement.isElement(n) && (n as any).align === align });
  return (
    <button
      onMouseDown={e => { e.preventDefault(); toggleAlign(editor, align); }}
      className={`p-2 rounded-xl transition-colors ${match ? 'bg-m3-primary/10 text-m3-primary' : 'text-m3-on-surface/60 hover:bg-m3-surface-container-high'}`}
      title={`Align ${align}`}
    >
      {icon}
    </button>
  );
};

const TableDropdown = () => {
  const editor = useSlate();
  const [isOpen, setIsOpen] = useState(false);
  const [hoveredCell, setHoveredCell] = useState<{r: number, c: number} | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInsertTable = (rows: number, cols: number) => {
    const tableRow = Array.from({ length: rows }).map(() => ({
      type: 'table-row',
      children: Array.from({ length: cols }).map(() => ({
        type: 'table-cell',
        children: [{ type: 'paragraph', children: [{ text: '' }] }]
      }))
    }));
    
    Transforms.insertNodes(editor, {
      type: 'table',
      children: tableRow
    } as any);
    
    setIsOpen(false);
    setHoveredCell(null);
  };

  return (
    <div className="relative inline-flex items-center ml-1" ref={dropdownRef}>
      <button
        onMouseDown={e => { e.preventDefault(); setIsOpen(!isOpen); }}
        className={`p-2 rounded-xl transition-colors flex items-center gap-1 ${isOpen ? 'bg-m3-primary/10 text-m3-primary' : 'text-m3-on-surface/60 hover:bg-m3-surface-container-high'}`}
        title="Table"
      >
        <TableIcon className="w-4 h-4" />
        <ChevronDown className="w-3 h-3" />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-1 bg-m3-surface border border-m3-outline/20 rounded-xl shadow-xl p-4 z-50 min-w-[200px]">
          <div className="text-xs font-semibold text-m3-on-surface/60 mb-3 text-center">
             {hoveredCell ? `Insert Table ${hoveredCell.c + 1}x${hoveredCell.r + 1}` : 'Insert Table'}
          </div>
          
          <div className="grid grid-cols-10 gap-[2px]">
             {Array.from({ length: 8 }).map((_, r) => (
                Array.from({ length: 10 }).map((_, c) => {
                   const isHighlighted = hoveredCell && r <= hoveredCell.r && c <= hoveredCell.c;
                   return (
                      <button
                         key={`${r}-${c}`}
                         className={`w-4 h-4 border transition-colors ${isHighlighted ? 'bg-m3-primary/20 border-m3-primary' : 'bg-transparent border-m3-outline/20 hover:border-m3-primary/50'}`}
                         onMouseEnter={() => setHoveredCell({ r, c })}
                         onMouseDown={e => { e.preventDefault(); handleInsertTable(r + 1, c + 1); }}
                      />
                   );
                })
             ))}
          </div>

          <div className="border-t border-m3-outline/20 pt-2 -mx-4 px-4 mt-3">
             <button
               onMouseDown={e => { e.preventDefault(); handleInsertTable(2, 2); }}
               className="w-full flex items-center gap-2 p-2 rounded-lg text-sm font-medium text-m3-on-surface/80 hover:bg-m3-surface-container-high transition-colors"
             >
                <TableIcon className="w-4 h-4" />
                Quick Table (2x2)
             </button>
          </div>
        </div>
      )}
    </div>
  );
};

const HeadingDropdown = () => {
  const editor = useSlate();
  const format = ['heading-one', 'heading-two', 'heading-three', 'heading-four', 'code-block'].find(f => isBlockActive(editor, f)) || 'paragraph';

  return (
    <select
      value={format}
      onChange={e => { toggleBlock(editor, e.target.value); }}
      className="bg-transparent border border-m3-outline/20 rounded-lg text-xs font-medium text-m3-on-surface px-2 py-1 mx-1 outline-none focus:ring-1 focus:ring-m3-primary cursor-pointer hover:bg-m3-surface-container"
    >
      <option value="paragraph">Paragraph</option>
      <option value="heading-one">Heading 1</option>
      <option value="heading-two">Heading 2</option>
      <option value="heading-three">Heading 3</option>
      <option value="heading-four">Heading 4</option>
      <option value="code-block">Code Block</option>
    </select>
  );
};

const toggleMarkValue = (editor: any, format: string, value: string) => {
  if (value) {
    Editor.addMark(editor, format, value);
  } else {
    Editor.removeMark(editor, format);
  }
};

const THEME_COLORS = [
  '#ffffff', '#000000', '#e7e6e6', '#44546a', '#5b9bd5', '#ed7d31', '#a5a5a5', '#ffc000', '#4472c4', '#70ad47'
];
const STANDARD_COLORS = [
  '#c00000', '#ff0000', '#ffc000', '#ffff00', '#92d050', '#00b050', '#00b0f0', '#0070c0', '#002060', '#7030a0'
];

const ColorPaletteDropdown = () => {
  const editor = useSlate();
  const marks = Editor.marks(editor) as any;
  const currentColor = marks?.color || '#000000';
  
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative inline-flex items-center ml-1" ref={dropdownRef}>
      <div className="flex items-center border border-transparent hover:bg-m3-surface-container-high rounded-xl overflow-hidden transition-colors">
        <button 
          onMouseDown={e => { e.preventDefault(); toggleMarkValue(editor, 'color', currentColor); setIsOpen(false); }}
          className="p-2 relative flex flex-col items-center justify-center gap-0.5"
          title="Text Color"
        >
          <Palette className="w-4 h-4 text-m3-on-surface" />
          <div className="w-4 h-1 rounded-sm" style={{ backgroundColor: currentColor === 'transparent' ? '#000' : currentColor }} />
        </button>
        <button
          onMouseDown={e => { e.preventDefault(); setIsOpen(!isOpen); }}
          className="p-1 px-1.5 border-l border-m3-outline/10 text-m3-on-surface/60 hover:text-m3-on-surface"
        >
          <ChevronDown className="w-3 h-3" />
        </button>
      </div>

      {isOpen && (
        <div className="absolute top-full left-0 mt-1 bg-m3-surface border border-m3-outline/20 rounded-xl shadow-xl p-3 z-50 w-64">
          
          <div className="mb-3">
            <div className="text-xs font-semibold text-m3-on-surface/60 mb-2">Theme Colors</div>
            <div className="grid grid-cols-10 gap-1">
              {THEME_COLORS.map(color => (
                <button
                  key={color}
                  onMouseDown={e => { e.preventDefault(); toggleMarkValue(editor, 'color', color); setIsOpen(false); }}
                  className={`w-5 h-5 rounded-sm border ${color === '#ffffff' ? 'border-m3-outline/20' : 'border-transparent'} hover:scale-110 transition-transform`}
                  style={{ backgroundColor: color }}
                  title={color}
                />
              ))}
            </div>
          </div>
          
          <div className="mb-3">
            <div className="text-xs font-semibold text-m3-on-surface/60 mb-2">Standard Colors</div>
            <div className="grid grid-cols-10 gap-1">
              {STANDARD_COLORS.map(color => (
                <button
                  key={color}
                  onMouseDown={e => { e.preventDefault(); toggleMarkValue(editor, 'color', color); setIsOpen(false); }}
                  className="w-5 h-5 rounded-sm border border-transparent hover:scale-110 transition-transform"
                  style={{ backgroundColor: color }}
                  title={color}
                />
              ))}
            </div>
          </div>

          <div className="border-t border-m3-outline/20 pt-2 -mx-3 px-3">
            <div className="relative flex items-center gap-2 hover:bg-m3-surface-container-high p-2 rounded-lg cursor-pointer transition-colors overflow-hidden">
               <Palette className="w-4 h-4 text-m3-on-surface/60" />
               <span className="text-sm font-medium text-m3-on-surface">More Colors...</span>
               <input
                type="color"
                value={currentColor === 'transparent' ? '#000000' : currentColor}
                onChange={e => { toggleMarkValue(editor, 'color', e.target.value); setIsOpen(false); }}
                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
              />
            </div>
          </div>

        </div>
      )}
    </div>
  );
};

const FontSizeSelect = () => {
  const editor = useSlate();
  const marks = Editor.marks(editor) as any;
  const size = marks?.fontSize || '';

  return (
    <select
      value={size}
      onChange={e => { toggleMarkValue(editor, 'fontSize', e.target.value); }}
      className="bg-transparent border border-m3-outline/20 rounded-lg text-xs font-medium text-m3-on-surface px-2 py-1 mx-1 outline-none focus:ring-1 focus:ring-m3-primary w-20 cursor-pointer hover:bg-m3-surface-container"
    >
      <option value="">Size</option>
      <option value="12px">12px</option>
      <option value="14px">14px</option>
      <option value="16px">16px</option>
      <option value="18px">18px</option>
      <option value="20px">20px</option>
      <option value="24px">24px</option>
      <option value="32px">32px</option>
    </select>
  );
};


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

const serializeTextOnly = (node: any): string => {
  if (node.text !== undefined) {
    return node.text;
  }
  if (node.children) {
    return node.children.map(serializeTextOnly).join('');
  }
  return '';
};

// --- Toolbar Buttons ---
const toggleBlock = (editor: any, format: string) => {
  const isActive = isBlockActive(editor, format);
  const isList = LIST_TYPES.includes(format);

  Transforms.unwrapNodes(editor, {
    match: n => !Editor.isEditor(n) && SlateElement.isElement(n) && LIST_TYPES.includes((n as any).type),
    split: true,
  });

  if (format === 'code-block' && !isActive) {
    const { selection } = editor;
    if (selection) {
      const blocks = Array.from(
        Editor.nodes(editor, {
          at: selection,
          match: n => !Editor.isEditor(n) && SlateElement.isElement(n) && Editor.isBlock(editor, n)
        })
      );
      
      if (blocks.length > 1) {
        const mergedText = blocks
          .map(([node]) => serializeTextOnly(node))
          .join('\n');
          
        Transforms.removeNodes(editor, { at: selection });
        Transforms.insertNodes(editor, {
          type: 'code-block',
          children: [{ text: mergedText }]
        } as any);
        return;
      }
    }
  }

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

const BlockButton = ({ format, icon, title }: { format: string, icon: React.ReactNode, title?: string }) => {
  const editor = useSlate();
  const active = isBlockActive(editor, format);
  return (
    <button
      onMouseDown={event => {
        event.preventDefault();
        toggleBlock(editor, format);
      }}
      className={`p-2 rounded-xl transition-colors ${active ? 'bg-m3-primary/10 text-m3-primary' : 'text-m3-on-surface/60 hover:bg-m3-surface-container-high'}`}
      title={title}
    >
      {icon}
    </button>
  );
};

const MarkButton = ({ format, icon, title }: { format: string, icon: React.ReactNode, title?: string }) => {
  const editor = useSlate();
  const active = isMarkActive(editor, format);
  return (
    <button
      onMouseDown={event => {
        event.preventDefault();
        toggleMark(editor, format);
      }}
      className={`p-2 rounded-xl transition-colors ${active ? 'bg-m3-primary/10 text-m3-primary' : 'text-m3-on-surface/60 hover:bg-m3-surface-container-high'}`}
      title={title}
    >
      {icon}
    </button>
  );
};

// --- Element Renderers ---
const Element = ({ attributes, children, element }: any) => {
  const style = { textAlign: element.align };
  switch (element.type) {
    case 'block-quote':
      return <blockquote style={style} {...attributes} className="border-l-4 border-m3-primary pl-4 italic my-4">{children}</blockquote>;
    case 'bulleted-list':
      return <ul style={style} {...attributes} className="list-disc ml-6 my-4">{children}</ul>;
    case 'heading-one':
      return <h1 style={style} {...attributes} className="text-4xl font-bold mt-8 mb-4">{children}</h1>;
    case 'heading-two':
      return <h2 style={style} {...attributes} className="text-2xl font-bold mt-6 mb-3">{children}</h2>;
    case 'heading-three':
      return <h3 style={style} {...attributes} className="text-xl font-bold mt-5 mb-2">{children}</h3>;
    case 'heading-four':
      return <h4 style={style} {...attributes} className="text-lg font-bold mt-4 mb-2">{children}</h4>;
    case 'list-item':
      return <li style={style} {...attributes}>{children}</li>;
    case 'numbered-list':
      return <ol style={style} {...attributes} className="list-decimal ml-6 my-4">{children}</ol>;
    case 'image':
      return (
          <div style={style} {...attributes} className="my-6">
              <div contentEditable={false}>
                  <img src={element.url} alt="" className="max-w-full rounded-2xl shadow-md block" />
              </div>
              {children}
          </div>
      );
    case 'link':
      return (
        <a {...attributes} href={element.url} className="text-m3-primary underline" target="_blank" rel="noopener noreferrer">
          {children}
        </a>
      );
    case 'code-block':
      return (
        <pre style={style} {...attributes} className="bg-[#1e1c24] text-[#f8f8f2] p-6 rounded-2xl overflow-x-auto text-sm font-mono my-4 border border-white/5 shadow-inner">
          <code className="bg-transparent p-0 text-[#f8f8f2]">{children}</code>
        </pre>
      );
    case 'table':
      return (
        <table className="w-full border-collapse border border-m3-outline/20 my-4">
          <tbody {...attributes}>{children}</tbody>
        </table>
      );
    case 'table-row':
      return <tr {...attributes} className="border-b border-m3-outline/20">{children}</tr>;
    case 'table-cell':
      return <td {...attributes} className="p-3 border border-m3-outline/20 align-top relative">{children}</td>;
    default:
      return <p style={style} {...attributes} className="mb-4 text-lg min-h-[1.5em]">{children}</p>;
  }
};

const Leaf = ({ attributes, children, leaf }: any) => {
  if (leaf.bold) children = <strong>{children}</strong>;
  if (leaf.italic) children = <em>{children}</em>;
  if (leaf.underline) children = <u>{children}</u>;
  if (leaf.code) children = <code className="bg-m3-primary/10 px-1.5 py-0.5 rounded text-sm font-mono text-m3-primary">{children}</code>;
  if (leaf.superscript) children = <sup>{children}</sup>;
  if (leaf.subscript) children = <sub>{children}</sub>;
  
  const style: React.CSSProperties = {};
  if (leaf.color) style.color = leaf.color;
  if (leaf.fontSize) style.fontSize = leaf.fontSize;

  return <span {...attributes} style={style}>{children}</span>;
};