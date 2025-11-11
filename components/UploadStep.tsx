import React, { useState, useCallback, useRef } from 'react';
import JSZip from 'jszip';
import { GeneratedFile } from '../types';

interface UploadStepProps {
    onUploadComplete: (files: GeneratedFile[]) => void;
}

const isTextFile = (fileName: string): boolean => {
    const textExtensions = [
        '.js', '.jsx', '.ts', '.tsx', '.html', '.css', '.scss', '.json', '.md', '.txt', 
        '.py', '.go', '.java', '.c', '.cpp', '.h', '.hpp', '.rs', '.rb', '.php',
        '.yml', '.yaml', '.toml', '.ini', '.sh', '.xml', 'LICENSE', '.env', '.gitignore',
        '.svg'
    ];
    const lowerFileName = fileName.toLowerCase();
    if (!lowerFileName.includes('.')) {
        const commonNoExt = ['dockerfile', 'procfile', 'readme'];
        return commonNoExt.includes(lowerFileName);
    }
    return textExtensions.some(ext => lowerFileName.endsWith(ext));
};

const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5MB

const UploadStep: React.FC<UploadStepProps> = ({ onUploadComplete }) => {
    const [isDragging, setIsDragging] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [processedFiles, setProcessedFiles] = useState<GeneratedFile[]>([]);
    const zipInputRef = useRef<HTMLInputElement>(null);
    const folderInputRef = useRef<HTMLInputElement>(null);
    
    const resetState = () => {
        setIsProcessing(false);
        setError(null);
        setProcessedFiles([]);
    };

    const handleFileProcessing = useCallback(async (processor: () => Promise<GeneratedFile[]>) => {
        resetState();
        setIsProcessing(true);
        try {
            const files = await processor();
            if (files.length === 0) {
                setError("No valid text files were found in the upload. Please check your folder or .zip file and try again.");
                return;
            }
            setProcessedFiles(files);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An unknown error occurred during processing.');
            console.error(err);
        } finally {
            setIsProcessing(false);
        }
    }, []);

    const processZip = async (zipFile: File): Promise<GeneratedFile[]> => {
        const zip = await JSZip.loadAsync(zipFile);
        const filePromises: Promise<GeneratedFile | null>[] = [];

        zip.forEach((relativePath, file) => {
            if (!file.dir && isTextFile(relativePath) && file._data.uncompressedSize < MAX_FILE_SIZE_BYTES) {
                const promise = file.async('string').then(content => ({
                    filePath: relativePath,
                    code: content
                })).catch(() => null);
                filePromises.push(promise);
            }
        });
        
        const results = (await Promise.all(filePromises)).filter((f): f is GeneratedFile => f !== null);
        
        // Strip common root directory if it exists
        if (results.length > 0) {
            const firstPath = results[0].filePath;
            const rootDir = firstPath.includes('/') ? firstPath.split('/')[0] : null;

            if (rootDir && results.every(f => f.filePath.startsWith(rootDir + '/'))) {
                return results.map(f => ({
                    ...f,
                    filePath: f.filePath.substring(rootDir.length + 1)
                })).filter(f => f.filePath); // Remove the root folder itself
            }
        }
        return results;
    };

    const processFolder = async (fileList: FileList): Promise<GeneratedFile[]> => {
        const files = Array.from(fileList);
        if (files.length === 0) return [];

        const basePath = files[0].webkitRelativePath.split('/')[0] + '/';
        
        const filePromises = files.map(file => {
            return new Promise<GeneratedFile | null>((resolve) => {
                const relativePath = file.webkitRelativePath.replace(basePath, '');
                if (!relativePath || !isTextFile(relativePath) || file.size > MAX_FILE_SIZE_BYTES) {
                    resolve(null);
                    return;
                }
                const reader = new FileReader();
                reader.onload = (e) => resolve({ filePath: relativePath, code: e.target?.result as string });
                reader.onerror = () => resolve(null);
                reader.readAsText(file);
            });
        });

        const results = await Promise.all(filePromises);
        return results.filter((f): f is GeneratedFile => f !== null);
    };

    const handleZipSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            handleFileProcessing(() => processZip(file));
        }
        e.target.value = '';
    };

    const handleFolderSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (files && files.length > 0) {
            handleFileProcessing(() => processFolder(files));
        }
        e.target.value = '';
    };
    
    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => { e.preventDefault(); setIsDragging(true); };
    const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => { e.preventDefault(); setIsDragging(false); };
    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files?.[0];
        if (file && (file.type === 'application/zip' || file.name.endsWith('.zip'))) {
             handleFileProcessing(() => processZip(file));
        } else {
            setError("Invalid file type. Please drop a single .zip file.");
        }
    };

    return (
        <div>
            <h2 className="text-2xl font-semibold text-text-primary mb-4">Upload Your Project</h2>
            <p className="text-text-secondary mb-6">Upload your frontend project as a folder or a .zip file. We'll analyze the code to generate a matching backend.</p>
            
            <div 
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`p-8 border-2 border-dashed rounded-lg text-center transition-colors ${isDragging ? 'border-primary bg-primary/10' : 'border-border hover:border-secondary'}`}
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12 text-text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 7.5h-.75A2.25 2.25 0 004.5 9.75v7.5a2.25 2.25 0 002.25 2.25h7.5a2.25 2.25 0 002.25-2.25v-7.5a2.25 2.25 0 00-2.25-2.25h-.75m-6 3.75l3 3m0 0l3-3m-3 3V1.5m-9 13.5h18" />
                </svg>
                <p className="mt-4 text-text-primary">Drag & drop your .zip file here</p>
                <p className="text-sm text-text-secondary mt-1">or use the buttons below</p>
                <div className="mt-6 flex justify-center gap-4 flex-wrap">
                    <input type="file" ref={zipInputRef} onChange={handleZipSelect} accept=".zip" className="hidden" />
                    <input type="file" ref={folderInputRef} onChange={handleFolderSelect} webkitdirectory="" mozdirectory="" className="hidden" />
                    <button onClick={() => folderInputRef.current?.click()} className="px-4 py-2 border border-border rounded-md text-sm font-medium bg-surface hover:bg-border">Select Folder</button>
                    <button onClick={() => zipInputRef.current?.click()} className="px-4 py-2 border border-border rounded-md text-sm font-medium bg-surface hover:bg-border">Select .zip File</button>
                </div>
            </div>

            {isProcessing && <p className="text-center mt-4 text-text-secondary animate-pulse">Processing files...</p>}
            {error && <p className="text-center mt-4 text-red-400 bg-red-900/20 p-3 rounded-md">{error}</p>}
            
            {processedFiles.length > 0 && (
                <div className="mt-6">
                    <h3 className="font-semibold text-text-primary">Found {processedFiles.length} readable files:</h3>
                    <ul className="mt-2 p-4 bg-background border border-border rounded-md max-h-48 overflow-y-auto text-sm font-mono text-text-secondary space-y-1">
                        {processedFiles.slice(0, 100).map(f => <li key={f.filePath} className="truncate">{f.filePath}</li>)}
                         {processedFiles.length > 100 && <li>... and {processedFiles.length - 100} more</li>}
                    </ul>
                </div>
            )}

            <div className="mt-8 flex justify-end">
                <button
                    onClick={() => onUploadComplete(processedFiles)}
                    disabled={processedFiles.length === 0 || isProcessing}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-background focus:ring-primary disabled:bg-gray-500 disabled:cursor-not-allowed"
                >
                    Next: Configure Backend
                </button>
            </div>
        </div>
    );
};

export default UploadStep;
