
import React, { useState, useEffect } from 'react';

interface CodeBlockProps {
    code: string;
    filename: string;
}

const CodeBlock: React.FC<CodeBlockProps> = ({ code, filename }) => {
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(code);
        setCopied(true);
    };
    
    useEffect(() => {
        if (copied) {
            const timer = setTimeout(() => setCopied(false), 2000);
            return () => clearTimeout(timer);
        }
    }, [copied]);

    return (
        <div className="bg-background rounded-lg border border-border h-full flex flex-col">
            <div className="flex justify-between items-center p-3 border-b border-border">
                <p className="text-sm font-mono text-text-secondary">{filename}</p>
                <button
                    onClick={handleCopy}
                    className="flex items-center gap-2 px-3 py-1 text-sm bg-surface hover:bg-border rounded-md transition-colors"
                >
                    {copied ? (
                        <>
                            <svg className="w-4 h-4 text-accent" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.052-.143z" clipRule="evenodd" /></svg>
                            Copied!
                        </>
                    ) : (
                       <>
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>
                            Copy
                       </>
                    )}
                </button>
            </div>
            <pre className="p-4 text-sm overflow-auto flex-grow">
                <code className="language-javascript">{code}</code>
            </pre>
        </div>
    );
};

export default CodeBlock;
