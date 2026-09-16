/**
 * File System Access API utilities for Direct Disk Editing
 * Allows opening a local markdown file and saving directly back to disk.
 */

export interface LocalFileConnection {
  handle: FileSystemFileHandle | null;
  name: string;
  isDirectSync: boolean;
  lastSavedAt: Date | null;
}

export const isFileSystemAccessSupported = (): boolean => {
  return typeof window !== 'undefined' && 'showOpenFilePicker' in window;
};

/**
 * Open a local markdown file using File System Access API
 */
export async function openLocalMarkdownFile(): Promise<{
  handle: FileSystemFileHandle;
  name: string;
  content: string;
} | null> {
  if (!isFileSystemAccessSupported()) {
    throw new Error('File System Access API is not supported in this browser.');
  }

  try {
    const [handle] = await (window as any).showOpenFilePicker({
      types: [
        {
          description: 'Markdown Files (*.md, *.markdown, *.txt)',
          accept: {
            'text/markdown': ['.md', '.markdown', '.mdown', '.mkd'],
            'text/plain': ['.txt'],
          },
        },
      ],
      multiple: false,
    });

    if (!handle) return null;

    const file = await handle.getFile();
    const content = await file.text();

    return {
      handle,
      name: file.name,
      content,
    };
  } catch (err: any) {
    if (err.name === 'AbortError') {
      // User cancelled the picker
      return null;
    }
    throw err;
  }
}

/**
 * Save content directly to an existing FileSystemFileHandle on disk
 */
export async function saveDirectlyToHandle(
  handle: FileSystemFileHandle,
  content: string
): Promise<void> {
  // Check and request write permission if not already granted
  const opts = { mode: 'readwrite' as const };
  // @ts-ignore
  if ((await handle.queryPermission?.(opts)) !== 'granted') {
    // @ts-ignore
    const status = await handle.requestPermission?.(opts);
    if (status !== 'granted') {
      throw new Error('Permission to write to the local file was denied.');
    }
  }

  const writable = await (handle as any).createWritable();
  await writable.write(content);
  await writable.close();
}

/**
 * Save As: Prompt user for destination file and save directly
 */
export async function saveAsNewLocalMarkdownFile(
  content: string,
  suggestedName: string
): Promise<{ handle: FileSystemFileHandle; name: string } | null> {
  if (!isFileSystemAccessSupported()) {
    throw new Error('File System Access API is not supported in this browser.');
  }

  try {
    const handle = await (window as any).showSaveFilePicker({
      suggestedName: suggestedName.endsWith('.md') ? suggestedName : `${suggestedName}.md`,
      types: [
        {
          description: 'Markdown File (*.md)',
          accept: {
            'text/markdown': ['.md'],
          },
        },
      ],
    });

    if (!handle) return null;

    const writable = await handle.createWritable();
    await writable.write(content);
    await writable.close();

    return {
      handle,
      name: handle.name,
    };
  } catch (err: any) {
    if (err.name === 'AbortError') {
      return null;
    }
    throw err;
  }
}
