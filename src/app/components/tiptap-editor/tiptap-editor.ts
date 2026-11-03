import { Component, ElementRef, OnDestroy, OnInit, ViewChild, ChangeDetectorRef } from '@angular/core';
import { Editor } from '@tiptap/core';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import Image from '@tiptap/extension-image';
import { TableKit } from '@tiptap/extension-table';
import beautify from 'js-beautify';
import ImageResize from 'tiptap-extension-resize-image';
import Subscript from '@tiptap/extension-subscript';
import Superscript from '@tiptap/extension-superscript';
import Link from '@tiptap/extension-link';
import { TextStyle, FontSize } from '@tiptap/extension-text-style';
import { FormsModule } from '@angular/forms';
import { CharacterCount } from '@tiptap/extensions';

@Component({
  selector: 'app-tiptap-editor',
  imports: [
    FormsModule
  ],
  templateUrl: './tiptap-editor.html',
  styleUrl: './tiptap-editor.scss',
})
export class TiptapEditor implements OnInit, OnDestroy {

  htmlGerado: string = '';
  menuTabelaAberto = false;

  @ViewChild('element', { static: true }) element!: ElementRef;
  editor!: Editor;

  constructor(private cdr: ChangeDetectorRef) {
  }

  ngOnInit(): void {
    this.editor = new Editor({
      element: this.element.nativeElement,
      extensions: [
        StarterKit,
        Underline,
        TextAlign.configure({
          types: ['heading', 'paragraph']
        }),
        Image.configure({
          allowBase64: true,
        }),
        TableKit.configure({
          table: {
            resizable: true,
            HTMLAttributes: {
              class: 'ck-table-resized',
            },
          },
        }),
        ImageResize.configure({
          minWidth: 50,
          maxWidth: 1200,
        }),
        TextAlign.configure({
          types: ['heading', 'paragraph'],
          alignments: ['left', 'center', 'right', 'justify'],
        }),
        Link.configure({
          openOnClick: false,
        }),
        FontSize.configure({
          types: ['textStyle'],
        }),
        Subscript,
        Superscript,
        TextStyle,
      ],
      content: '',
      onUpdate: () => {
        this.cdr.detectChanges();
      },
      onSelectionUpdate: () => {
        this.cdr.detectChanges();
      }
    });
  }


  ngOnDestroy(): void {
    if (this.editor) {
      this.editor.destroy();
    }
  }


  /** 
  * Abre o seletor de arquivos para inserir uma imagem local no editor. 
  */
  adicionarImagem() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';

    input.onchange = (event: any) => {
      const file = event.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.editor.chain().focus().setImage({ src: e.target.result }).run();
      };
      reader.readAsDataURL(file);
    };

    input.click();
  }


  /** 
  * Insere uma tabela 2x2 com cabeçalho na posição atual do cursor. 
  */
  inserirTabela() {
    if (this.editor.isActive('table')) {
      return;
    }

    try {
      this.editor.chain().focus()
        .insertTable({ rows: 2, cols: 2, withHeaderRow: true })
        .run();
    } catch (e) {
      console.error('Erro ao inserir tabela:', e);
    }
  }


  /** 
  * Extrai, limpa os estilos inline do Tiptap e formata o HTML atual do editor. 
  * 
  * @returns void, atualizando a propriedade htmlGerado do componente
  */
  mostrarHtml() {
    const htmlBruto = this.editor.getHTML()
      .replace(/ style="min-width: \d+px;"/g, '')
      .replace(/<p><\/p>/g, '');

    this.htmlGerado = beautify.html(htmlBruto, {
      indent_size: 4,
      indent_char: ' ',
      max_preserve_newlines: 4,
      preserve_newlines: true,
      indent_inner_html: true
    });
  }


  /** 
   * Gera e dispara o download automático do conteúdo do editor em um arquivo HTML formatado. 
  */
  baixarHtml() {
    const htmlParaBaixar = `
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
      <meta charset="UTF-8">
      <title>Documento Gerado - PoC Tiptap</title>
      <style>
        body { font-family: sans-serif; padding: 20px; }
        table { border-collapse: collapse; width: 100%; margin: 12px 0; }
        td, th { border: 1px solid #94a3b8; padding: 8px; }
        th { background-color: #f1f5f9; }
        img { max-width: 100%; height: auto; }
      </style>
    </head>
    <body>
      ${this.editor.getHTML()}
    </body>
    </html>
  `;

    const blob = new Blob([htmlParaBaixar], { type: 'text/html' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'documentoGerado.html';
    a.click();
    window.URL.revokeObjectURL(url);
  }


  /** 
  * Adiciona um link à seleção de texto atual após validar a URL informada, 
  * ou remove se já houver link na seleção. 
  */
  adicionarLink() {
    if (this.editor.isActive('link')) {
      this.editor.chain().focus().unsetLink().run();
      return;
    }

    if (this.editor.state.selection.empty) {
      return;
    }

    const url = window.prompt('Insira a URL:', '');
    if (!url) return;

    const urlValida =
      /^(https?:\/\/)?([\w\-]+\.)+[a-z]{2,}(:\d+)?(\/.*)?$|^\/.*$/i.test(url)
      || url.includes('localhost');

    if (!urlValida) {
      alert('Por favor, insira uma URL válida.');
      return;
    }

    this.editor.chain().focus().setLink({ href: url }).run();
  }


  /**
   * Aplica um tamanho de fonte ao texto selecionado.
   * @param tamanho selecionado pelo usuário
   * @returns font-size aplicado ou removido se tamanho for vazio
   */
  aplicarTamanhoFonte(tamanho: string) {
    if (!tamanho) {
      this.editor.chain().focus().unsetFontSize().run();
      return;
    }

    this.editor.chain().focus().setFontSize(tamanho).run();
  }

}
