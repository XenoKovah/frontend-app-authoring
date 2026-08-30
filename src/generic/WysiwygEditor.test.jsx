import React from 'react';
import { render } from '@testing-library/react';

import { WysiwygEditor } from './WysiwygEditor';

let mockTinyMceProps;

jest.mock('react-redux', () => ({
  useSelector: () => ({ courseId: 'course-v1:org+course+run' }),
}));

jest.mock('../editors/sharedComponents/TinyMceWidget', () => ({
  __esModule: true,
  default: (props) => {
    mockTinyMceProps = props;
    return null;
  },
  prepareEditorRef: () => ({
    editorRef: { current: null },
    refReady: true,
    setEditorRef: jest.fn(),
  }),
}));

// What is stored on the course, and what TinyMCE makes of it when it loads it:
// the style attribute gains a trailing semicolon and the void element self-closes.
const storedHtml = '<p style="margin:0 20px 0">Bio</p>\n<img src="pic.png" alt="Bio Pic!">';
const reserializedHtml = '<p style="margin: 0 20px 0;">Bio</p>\n<img src="pic.png" alt="Bio Pic!" />';

const buildEditor = (content) => ({
  getContent: () => content,
  setContent: jest.fn(),
  selection: {
    getBookmark: jest.fn(),
    moveToBookmark: jest.fn(),
  },
});

describe('<WysiwygEditor />', () => {
  let onChange;

  beforeEach(() => {
    onChange = jest.fn();
    mockTinyMceProps = undefined;
    render(<WysiwygEditor initialValue={storedHtml} onChange={onChange} />);
    // TinyMCE hands the editor over once it has parsed the initial value.
    mockTinyMceProps.setEditorRef(buildEditor(reserializedHtml));
  });

  it('does not report the load-time re-serialization as a change', () => {
    mockTinyMceProps.onChange(reserializedHtml, buildEditor(reserializedHtml));

    expect(onChange).not.toHaveBeenCalled();
  });

  it('still ignores whitespace-only and quote-style differences', () => {
    mockTinyMceProps.onChange(storedHtml.replace(/\n/g, '\n  '), buildEditor(storedHtml));
    mockTinyMceProps.onChange(storedHtml.replace(/"/g, "'"), buildEditor(storedHtml));

    expect(onChange).not.toHaveBeenCalled();
  });

  it('reports an actual edit', () => {
    const edited = reserializedHtml.replace('Bio', 'Biography');
    mockTinyMceProps.onChange(edited, buildEditor(edited));

    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith(edited);
  });
});
