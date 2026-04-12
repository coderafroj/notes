'use client'

import { Extension } from '@tiptap/core'
import Suggestion from '@tiptap/suggestion'
import { ReactRenderer } from '@tiptap/react'
import tippy from 'tippy.js'
import {
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  ListChecks,
  Quote,
  Code2,
  Minus,
  Table,
  Image,
  Type,
  AlignLeft,
  AlignCenter,
  AlignRight,
} from 'lucide-react'
import CommandList from './CommandList'
import React from 'react'

export const SlashCommands = Extension.create({
  name: 'slashCommands',

  addOptions() {
    return {
      suggestion: {
        char: '/',
        command: ({ editor, range, props }: any) => {
          props.command({ editor, range })
        },
      },
    }
  },

  addProseMirrorPlugins() {
    return [
      Suggestion({
        editor: this.editor,
        ...this.options.suggestion,
      }),
    ]
  },
})

export const getSuggestionItems = ({ query }: { query: string }) => {
  return [
    {
      title: 'Heading 1',
      description: 'Big section heading',
      icon: React.createElement(Heading1, { size: 18 }),
      command: ({ editor, range }: any) => {
        editor.chain().focus().deleteRange(range).setNode('heading', { level: 1 }).run()
      },
    },
    {
      title: 'Heading 2',
      description: 'Medium section heading',
      icon: React.createElement(Heading2, { size: 18 }),
      command: ({ editor, range }: any) => {
        editor.chain().focus().deleteRange(range).setNode('heading', { level: 2 }).run()
      },
    },
    {
      title: 'Heading 3',
      description: 'Small section heading',
      icon: React.createElement(Heading3, { size: 18 }),
      command: ({ editor, range }: any) => {
        editor.chain().focus().deleteRange(range).setNode('heading', { level: 3 }).run()
      },
    },
    {
      title: 'Text',
      description: 'Just start writing with plain text',
      icon: React.createElement(Type, { size: 18 }),
      command: ({ editor, range }: any) => {
        editor.chain().focus().deleteRange(range).setNode('paragraph').run()
      },
    },
    {
      title: 'Bullet List',
      description: 'Create a simple bulleted list',
      icon: React.createElement(List, { size: 18 }),
      command: ({ editor, range }: any) => {
        editor.chain().focus().deleteRange(range).toggleBulletList().run()
      },
    },
    {
      title: 'Numbered List',
      description: 'Create a list with numbering',
      icon: React.createElement(ListOrdered, { size: 18 }),
      command: ({ editor, range }: any) => {
        editor.chain().focus().deleteRange(range).toggleOrderedList().run()
      },
    },
    {
      title: 'Task List',
      description: 'Track tasks with checkboxes',
      icon: React.createElement(ListChecks, { size: 18 }),
      command: ({ editor, range }: any) => {
        editor.chain().focus().deleteRange(range).toggleTaskList().run()
      },
    },
    {
      title: 'Quote',
      description: 'Capture a quotation',
      icon: React.createElement(Quote, { size: 18 }),
      command: ({ editor, range }: any) => {
        editor.chain().focus().deleteRange(range).toggleBlockquote().run()
      },
    },
    {
      title: 'Code Block',
      description: 'Insert a code snippet',
      icon: React.createElement(Code2, { size: 18 }),
      command: ({ editor, range }: any) => {
        editor.chain().focus().deleteRange(range).toggleCodeBlock().run()
      },
    },
    {
      title: 'Table',
      description: 'Insert a 3x3 table',
      icon: React.createElement(Table, { size: 18 }),
      command: ({ editor, range }: any) => {
        editor.chain().focus().deleteRange(range).insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()
      },
    },
    {
      title: 'Horizontal Rule',
      description: 'Insert a divider line',
      icon: React.createElement(Minus, { size: 18 }),
      command: ({ editor, range }: any) => {
        editor.chain().focus().deleteRange(range).setHorizontalRule().run()
      },
    },
    {
      title: 'Align Left',
      description: 'Left align text',
      icon: React.createElement(AlignLeft, { size: 18 }),
      command: ({ editor, range }: any) => {
        editor.chain().focus().deleteRange(range).setTextAlign('left').run()
      },
    },
    {
      title: 'Align Center',
      description: 'Center align text',
      icon: React.createElement(AlignCenter, { size: 18 }),
      command: ({ editor, range }: any) => {
        editor.chain().focus().deleteRange(range).setTextAlign('center').run()
      },
    },
    {
      title: 'Align Right',
      description: 'Right align text',
      icon: React.createElement(AlignRight, { size: 18 }),
      command: ({ editor, range }: any) => {
        editor.chain().focus().deleteRange(range).setTextAlign('right').run()
      },
    },
  ].filter((item) => item.title.toLowerCase().startsWith(query.toLowerCase()) || 
                     item.description.toLowerCase().includes(query.toLowerCase()))
}

export const renderItems = () => {
  let component: any
  let popup: any

  return {
    onStart: (props: any) => {
      component = new ReactRenderer(CommandList, {
        props,
        editor: props.editor,
      })

      popup = tippy('body', {
        getReferenceClientRect: props.clientRect,
        appendTo: () => document.body,
        content: component.element,
        showOnCreate: true,
        interactive: true,
        trigger: 'manual',
        placement: 'bottom-start',
      })[0]
    },

    onUpdate(props: any) {
      component.updateProps(props)

      popup.setProps({
        getReferenceClientRect: props.clientRect,
      })
    },

    onKeyDown(props: any) {
      if (props.event.key === 'Escape') {
        popup.hide()
        return true
      }

      return component.ref?.onKeyDown(props)
    },

    onExit() {
      popup.destroy()
      component.destroy()
    },
  }
}
