import React, { useState, useRef, useEffect } from 'react';
import { 
  Folder, 
  File, 
  ChevronRight, 
  ChevronDown, 
  Monitor,
  Code2,
  FileText,
  Settings,
  Database,
  Globe,
  Image,
  Coffee,
  Upload,
  GitBranch,
  Plus,
  FolderPlus,
  Copy,
  Trash2,
  MoreHorizontal,
  X,
  Check,
  Edit,
  Save
} from 'lucide-react';

const DevEnvironment = () => {
  const [terminalHistory, setTerminalHistory] = useState([
    { type: 'system', content: 'AI Development Environment V0 - Ready' },
    { type: 'system', content: 'Type your idea to begin...' }
  ]);
  const [currentInput, setCurrentInput] = useState('');
  const [fileStructure, setFileStructure] = useState({
    name: 'project',
    type: 'folder',
    expanded: true,
    children: [
      {
        name: 'teamnotes.txt',
        type: 'file',
        content: '# Team Notes\n## Project Goals\n(Goals will be defined here)\n\n## MVP Features\n(Features will be listed here)\n\n## Project State\nCurrent Stage: 1 (Idea & Definition)\nActive Agent: The Visionary'
      }
    ]
  });
  const [currentAgent, setCurrentAgent] = useState('visionary');
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editingContent, setEditingContent] = useState('');
  const [showContextMenu, setShowContextMenu] = useState(null);
  const [githubUrl, setGithubUrl] = useState('');
  const [showGithubInput, setShowGithubInput] = useState(false);
  const [showNewFileDialog, setShowNewFileDialog] = useState(false);
  const [newFileName, setNewFileName] = useState('');
  const [newFolderName, setNewFolderName] = useState('');
  const [showNewFolderDialog, setShowNewFolderDialog] = useState(false);
  const [aiSuggestion, setAiSuggestion] = useState('');
  const [showAiSuggestion, setShowAiSuggestion] = useState(false);
  const terminalRef = useRef(null);
  const inputRef = useRef(null);
  const fileInputRef = useRef(null);

  // AI Agent personalities
  const agents = {
    visionary: {
      name: 'The Visionary',
      title: 'Product Manager',
      color: 'text-purple-400'
    },
    architect: {
      name: 'The Architect', 
      title: 'Solutions Architect',
      color: 'text-blue-400'
    },
    builder: {
      name: 'The Builder',
      title: 'Software Engineer', 
      color: 'text-green-400'
    },
    guardian: {
      name: 'The Guardian',
      title: 'DevOps Engineer',
      color: 'text-red-400'
    }
  };

  // File icons mapping
  const getFileIcon = (fileName) => {
    const ext = fileName.split('.').pop().toLowerCase();
    const iconProps = { size: 16, className: "text-gray-400" };
    
    switch (ext) {
      case 'js':
      case 'jsx':
      case 'ts':
      case 'tsx':
        return <Coffee {...iconProps} className="text-yellow-400" />;
      case 'html':
        return <Globe {...iconProps} className="text-orange-400" />;
      case 'css':
      case 'scss':
        return <FileText {...iconProps} className="text-blue-400" />;
      case 'json':
        return <Settings {...iconProps} className="text-green-400" />;
      case 'md':
        return <FileText {...iconProps} className="text-purple-400" />;
      case 'sql':
        return <Database {...iconProps} className="text-cyan-400" />;
      case 'png':
      case 'jpg':
      case 'svg':
        return <Image {...iconProps} className="text-pink-400" />;
      default:
        return <File {...iconProps} />;
    }
  };

  // Generate AI suggestions based on content
  const generateAiSuggestion = (content, fileName) => {
    const ext = fileName?.split('.').pop()?.toLowerCase() || '';
    
    if (ext === 'js' || ext === 'jsx') {
      if (content.includes('function')) {
        return 'Add error handling with try-catch block';
      }
      if (content.includes('useState')) {
        return 'Consider adding useEffect for side effects';
      }
      return 'Add JSDoc comments for better documentation';
    }
    
    if (ext === 'css') {
      return 'Consider using CSS Grid or Flexbox for layout';
    }
    
    if (ext === 'html') {
      return 'Add semantic HTML5 elements for better accessibility';
    }
    
    if (ext === 'md') {
      return 'Add table of contents for better navigation';
    }
    
    return 'Consider adding comments for clarity';
  };

  // Simulate AI suggestion delay
  useEffect(() => {
    if (editingContent && selectedFile) {
      const timer = setTimeout(() => {
        const suggestion = generateAiSuggestion(editingContent, selectedFile.name);
        setAiSuggestion(suggestion);
        setShowAiSuggestion(true);
      }, 2000);
      
      return () => clearTimeout(timer);
    }
  }, [editingContent, selectedFile]);

  // Handle file upload
  const handleFileUpload = (event) => {
    const files = Array.from(event.target.files);
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const newFile = {
          name: file.name,
          type: 'file',
          content: e.target.result
        };
        
        setFileStructure(prev => ({
          ...prev,
          children: [...prev.children, newFile]
        }));
        
        setTerminalHistory(prev => [...prev, 
          { type: 'system', content: `Uploaded file: ${file.name}` }
        ]);
      };
      reader.readAsText(file);
    });
    event.target.value = '';
  };

  // Handle GitHub repo loading (mock implementation)
  const handleGithubLoad = async () => {
    if (!githubUrl.trim()) return;
    
    setIsProcessing(true);
    setTerminalHistory(prev => [...prev, 
      { type: 'system', content: `Loading GitHub repo: ${githubUrl}` }
    ]);
    
    // Mock GitHub repo structure
    setTimeout(() => {
      const mockRepoStructure = {
        name: 'github-repo',
        type: 'folder',
        expanded: true,
        children: [
          { name: 'README.md', type: 'file', content: '# GitHub Repository\n\nLoaded from: ' + githubUrl },
          { name: 'package.json', type: 'file', content: '{\n  "name": "github-project",\n  "version": "1.0.0"\n}' },
          {
            name: 'src',
            type: 'folder',
            expanded: false,
            children: [
              { name: 'index.js', type: 'file', content: 'console.log("Hello from GitHub!");' }
            ]
          }
        ]
      };
      
      setFileStructure(prev => ({
        ...prev,
        children: [...prev.children, mockRepoStructure]
      }));
      
      setTerminalHistory(prev => [...prev, 
        { type: 'system', content: `Successfully loaded GitHub repo structure` }
      ]);
      
      setIsProcessing(false);
      setShowGithubInput(false);
      setGithubUrl('');
    }, 2000);
  };

  // Add new file
  const addNewFile = () => {
    if (!newFileName.trim()) return;
    
    const newFile = {
      name: newFileName,
      type: 'file',
      content: `// ${newFileName}\n// Created by AI Development Environment\n\n`
    };
    
    setFileStructure(prev => ({
      ...prev,
      children: [...prev.children, newFile]
    }));
    
    setTerminalHistory(prev => [...prev, 
      { type: 'system', content: `Created new file: ${newFileName}` }
    ]);
    
    setNewFileName('');
    setShowNewFileDialog(false);
    
    // Auto-select and edit the new file
    setSelectedFile(newFile);
    setEditingContent(newFile.content);
    setIsEditing(true);
  };

  // Add new folder
  const addNewFolder = () => {
    if (!newFolderName.trim()) return;
    
    const newFolder = {
      name: newFolderName,
      type: 'folder',
      expanded: true,
      children: []
    };
    
    setFileStructure(prev => ({
      ...prev,
      children: [...prev.children, newFolder]
    }));
    
    setTerminalHistory(prev => [...prev, 
      { type: 'system', content: `Created new folder: ${newFolderName}` }
    ]);
    
    setNewFolderName('');
    setShowNewFolderDialog(false);
  };

  // Copy file path
  const copyFilePath = (fileName) => {
    const path = `./project/${fileName}`;
    navigator.clipboard.writeText(path);
    setTerminalHistory(prev => [...prev, 
      { type: 'system', content: `Copied path: ${path}` }
    ]);
    setShowContextMenu(null);
  };

  // Delete file
  const deleteFile = (fileName) => {
    const removeFile = (children) => {
      return children.filter(child => {
        if (child.name === fileName) return false;
        if (child.children) {
          child.children = removeFile(child.children);
        }
        return true;
      });
    };
    
    setFileStructure(prev => ({
      ...prev,
      children: removeFile(prev.children)
    }));
    
    if (selectedFile?.name === fileName) {
      setSelectedFile(null);
      setIsEditing(false);
    }
    
    setTerminalHistory(prev => [...prev, 
      { type: 'system', content: `Deleted file: ${fileName}` }
    ]);
    setShowContextMenu(null);
  };

  // Save file changes
  const saveFile = () => {
    if (!selectedFile) return;
    
    const updateFileContent = (children) => {
      return children.map(child => {
        if (child.name === selectedFile.name && child.type === 'file') {
          return { ...child, content: editingContent };
        }
        if (child.children) {
          return { ...child, children: updateFileContent(child.children) };
        }
        return child;
      });
    };
    
    setFileStructure(prev => ({
      ...prev,
      children: updateFileContent(prev.children)
    }));
    
    setSelectedFile({ ...selectedFile, content: editingContent });
    setIsEditing(false);
    
    setTerminalHistory(prev => [...prev, 
      { type: 'system', content: `Saved file: ${selectedFile.name}` }
    ]);
  };

  // Accept AI suggestion
  const acceptAiSuggestion = () => {
    const newContent = editingContent + `\n// ${aiSuggestion}\n`;
    setEditingContent(newContent);
    setShowAiSuggestion(false);
    setAiSuggestion('');
  };

  // Reject AI suggestion
  const rejectAiSuggestion = () => {
    setShowAiSuggestion(false);
    setAiSuggestion('');
  };

  // Scroll terminal to bottom
  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [terminalHistory]);

  // Focus input when component mounts
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  // Mock AI response system
  const processAIMessage = async (message) => {
    setIsProcessing(true);
    
    // Simulate AI processing delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    const agent = agents[currentAgent];
    
    // Simple demo responses based on current agent
    if (currentAgent === 'visionary') {
      if (message.toLowerCase().includes('app') || message.toLowerCase().includes('website')) {
        const response = `${agent.name}: Excellent! I can help you define this project. Let me update your project goals...

Creating complete file: teamnotes.txt`;
        
        // Update file structure with complete content
        const updatedStructure = { ...fileStructure };
        const teamnotesFile = updatedStructure.children.find(f => f.name === 'teamnotes.txt');
        if (teamnotesFile) {
          teamnotesFile.content = `# Team Notes

## Project Goals
1. Create a user-friendly web application
2. Provide seamless user experience
3. Build scalable and maintainable codebase

## MVP Features
- User authentication system
- Core functionality implementation
- Responsive mobile-friendly design
- Basic admin panel

## Project State
Current Stage: 1 (Idea & Definition)  
Active Agent: The Visionary

## Next Steps
- Define specific user stories
- Clarify technical requirements
- Plan development roadmap`;
        }
        setFileStructure({ ...updatedStructure });
        
        return response + `\n\nYour teamnotes.txt has been updated with initial project structure. Use *next-stage when ready to move to architecture phase.`;
      }
    }

    return `${agent.name}: I'm processing your request "${message}". This is a demo - full AI integration coming soon!`;
  };

  const handleTerminalInput = async (e) => {
    if (e.key === 'Enter' && currentInput.trim()) {
      // Add user input to history
      setTerminalHistory(prev => [...prev, 
        { type: 'user', content: `$ ${currentInput}` }
      ]);

      const input = currentInput.trim();
      setCurrentInput('');

      // Check for special commands
      if (input === '*next-stage') {
        const nextAgents = ['visionary', 'architect', 'builder', 'guardian'];
        const currentIndex = nextAgents.indexOf(currentAgent);
        if (currentIndex < nextAgents.length - 1) {
          const nextAgent = nextAgents[currentIndex + 1];
          setCurrentAgent(nextAgent);
          setTerminalHistory(prev => [...prev, 
            { type: 'system', content: `Transitioning to ${agents[nextAgent].name}...` },
            { type: 'ai', content: `${agents[nextAgent].name}: Hello! I'm ready to help with the ${agents[nextAgent].title.toLowerCase()} phase.`, agent: nextAgent }
          ]);
        }
        return;
      }

      // Process with AI
      const response = await processAIMessage(input);
      setTerminalHistory(prev => [...prev, 
        { type: 'ai', content: response, agent: currentAgent }
      ]);
    }
    setIsProcessing(false);
  };

  // Render file tree recursively
  const renderFileTree = (node, depth = 0, path = '') => {
    const isFolder = node.type === 'folder';
    const currentPath = path ? `${path}/${node.name}` : node.name;
    
    return (
      <div key={`${currentPath}-${depth}`}>
        <div 
          className="flex items-center py-1 px-2 hover:bg-gray-700 cursor-pointer text-sm relative group"
          style={{ paddingLeft: `${depth * 16 + 8}px` }}
          onClick={() => {
            if (isFolder) {
              const updateExpanded = (nodes) => {
                return nodes.map(n => 
                  n.name === node.name && n.type === 'folder'
                    ? { ...n, expanded: !n.expanded }
                    : n.children ? { ...n, children: updateExpanded(n.children) } : n
                );
              };
              setFileStructure(prev => updateExpanded([prev])[0] || prev);
            } else {
              setSelectedFile(node);
              setEditingContent(node.content || '');
              setIsEditing(false);
            }
          }}
          onContextMenu={(e) => {
            e.preventDefault();
            if (!isFolder) {
              setShowContextMenu({ x: e.clientX, y: e.clientY, file: node });
            }
          }}
        >
          {isFolder ? (
            <>
              {node.expanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
              <Folder size={16} className="text-blue-400 mx-1" />
            </>
          ) : (
            <>
              <span className="w-[14px]"></span>
              {getFileIcon(node.name)}
              <span className="mx-1"></span>
            </>
          )}
          <span className={`text-gray-300 ${selectedFile?.name === node.name ? 'text-blue-400 font-semibold' : ''}`}>
            {node.name}
          </span>
          
          {!isFolder && (
            <div className="ml-auto opacity-0 group-hover:opacity-100 flex items-center space-x-1">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  copyFilePath(node.name);
                }}
                className="p-1 hover:bg-gray-600 rounded"
                title="Copy path"
              >
                <Copy size={12} className="text-gray-400" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowContextMenu({ x: e.clientX, y: e.clientY, file: node });
                }}
                className="p-1 hover:bg-gray-600 rounded"
                title="More options"
              >
                <MoreHorizontal size={12} className="text-gray-400" />
              </button>
            </div>
          )}
        </div>
        {isFolder && node.expanded && node.children && (
          <div>
            {node.children.map(child => renderFileTree(child, depth + 1, currentPath))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="h-screen bg-gray-900 text-gray-100 flex">
      {/* File Explorer */}
      <div className="w-80 bg-gray-800 border-r border-gray-700 flex flex-col">
        <div className="p-4 border-b border-gray-700">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold text-gray-200 flex items-center">
              <Code2 size={20} className="mr-2 text-blue-400" />
              Project Files
            </h2>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setShowNewFolderDialog(true)}
                className="p-1 hover:bg-gray-700 rounded"
                title="New Folder"
              >
                <FolderPlus size={16} className="text-gray-400" />
              </button>
              <button
                onClick={() => setShowNewFileDialog(true)}
                className="p-1 hover:bg-gray-700 rounded"
                title="New File"
              >
                <Plus size={16} className="text-gray-400" />
              </button>
            </div>
          </div>
          
          <div className="flex space-x-2">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded text-xs"
              title="Upload Files"
            >
              <Upload size={12} className="mr-1" />
              Upload
            </button>
            <button
              onClick={() => setShowGithubInput(true)}
              className="flex items-center px-3 py-1 bg-purple-600 hover:bg-purple-700 rounded text-xs"
              title="Load GitHub Repo"
            >
              <GitBranch size={12} className="mr-1" />
              GitHub
            </button>
          </div>
          
          {showGithubInput && (
            <div className="mt-2 space-y-2">
              <input
                type="text"
                value={githubUrl}
                onChange={(e) => setGithubUrl(e.target.value)}
                placeholder="https://github.com/user/repo"
                className="w-full px-2 py-1 bg-gray-700 border border-gray-600 rounded text-xs"
              />
              <div className="flex space-x-2">
                <button
                  onClick={handleGithubLoad}
                  className="px-2 py-1 bg-green-600 hover:bg-green-700 rounded text-xs"
                >
                  Load
                </button>
                <button
                  onClick={() => {
                    setShowGithubInput(false);
                    setGithubUrl('');
                  }}
                  className="px-2 py-1 bg-gray-600 hover:bg-gray-700 rounded text-xs"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
        
        <div className="flex-1 overflow-y-auto">
          {renderFileTree(fileStructure)}
        </div>
        
        <input
          ref={fileInputRef}
          type="file"
          multiple
          onChange={handleFileUpload}
          className="hidden"
        />
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-700 bg-gray-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Monitor size={20} className="mr-2 text-green-400" />
              <span className="text-lg font-semibold">AI Development Terminal</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className={`px-3 py-1 rounded-full text-xs font-medium bg-gray-700 ${agents[currentAgent].color}`}>
                {agents[currentAgent].name}
              </div>
              <div className="text-xs text-gray-400">
                {agents[currentAgent].title}
              </div>
            </div>
          </div>
        </div>

        <div className="flex-1 flex">
          {/* Terminal */}
          <div className="flex-1 flex flex-col">
            <div 
              ref={terminalRef}
              className="flex-1 p-4 overflow-y-auto font-mono text-sm"
            >
              {terminalHistory.map((entry, index) => (
                <div key={index} className="mb-2">
                  {entry.type === 'user' && (
                    <div className="text-green-400">{entry.content}</div>
                  )}
                  {entry.type === 'system' && (
                    <div className="text-blue-400">{entry.content}</div>
                  )}
                  {entry.type === 'ai' && (
                    <div className={`${entry.agent ? agents[entry.agent].color : 'text-purple-400'}`}>
                      {entry.content}
                    </div>
                  )}
                </div>
              ))}
              {isProcessing && (
                <div className="text-yellow-400 animate-pulse">
                  {agents[currentAgent].name} is thinking...
                </div>
              )}
            </div>

            {/* Input */}
            <div className="p-4 border-t border-gray-700 bg-gray-800">
              <div className="flex items-center">
                <span className="text-green-400 mr-2 font-mono">$</span>
                <input
                  ref={inputRef}
                  type="text"
                  value={currentInput}
                  onChange={(e) => setCurrentInput(e.target.value)}
                  onKeyDown={handleTerminalInput}
                  className="flex-1 bg-transparent outline-none text-gray-100 font-mono"
                  placeholder="Enter your idea or command..."
                  disabled={isProcessing}
                />
              </div>
              <div className="text-xs text-gray-500 mt-2">
                Commands: *next-stage | Type your project idea to begin
              </div>
            </div>
          </div>

          {/* File Editor */}
          {selectedFile && (
            <div className="w-1/2 border-l border-gray-700 flex flex-col bg-gray-850">
              <div className="p-3 border-b border-gray-700 bg-gray-800 flex items-center justify-between">
                <div className="flex items-center">
                  {getFileIcon(selectedFile.name)}
                  <span className="ml-2 text-sm font-medium">{selectedFile.name}</span>
                </div>
                <div className="flex items-center space-x-2">
                  {!isEditing && (
                    <button
                      onClick={() => {
                        setIsEditing(true);
                        setEditingContent(selectedFile.content || '');
                      }}
                      className="p-1 hover:bg-gray-700 rounded"
                      title="Edit"
                    >
                      <Edit size={14} className="text-gray-400" />
                    </button>
                  )}
                  {isEditing && (
                    <button
                      onClick={saveFile}
                      className="p-1 hover:bg-gray-700 rounded"
                      title="Save"
                    >
                      <Save size={14} className="text-green-400" />
                    </button>
                  )}
                  <button
                    onClick={() => setSelectedFile(null)}
                    className="p-1 hover:bg-gray-700 rounded"
                    title="Close"
                  >
                    <X size={14} className="text-gray-400" />
                  </button>
                </div>
              </div>
              
              <div className="flex-1 relative">
                {isEditing ? (
                  <textarea
                    value={editingContent}
                    onChange={(e) => setEditingContent(e.target.value)}
                    className="w-full h-full p-4 bg-gray-900 text-gray-100 font-mono text-sm resize-none outline-none border-none"
                    placeholder="Start typing..."
                  />
                ) : (
                  <pre className="w-full h-full p-4 bg-gray-900 text-gray-100 font-mono text-sm overflow-auto">
                    {selectedFile.content || 'Empty file'}
                  </pre>
                )}
                
                {/* AI Suggestion Popup */}
                {showAiSuggestion && (
                  <div className="absolute bottom-4 right-4 bg-gray-800 border border-gray-600 rounded-lg p-3 shadow-lg max-w-sm">
                    <div className="text-sm text-gray-300 mb-2">
                      AI Suggestion:
                    </div>
                    <div className="text-xs text-gray-400 mb-3">
                      {aiSuggestion}
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={acceptAiSuggestion}
                        className="flex items-center px-2 py-1 bg-green-600 hover:bg-green-700 rounded text-xs"
                      >
                        <Check size={12} className="mr-1" />
                        Accept
                      </button>
                      <button
                        onClick={rejectAiSuggestion}
                        className="flex items-center px-2 py-1 bg-red-600 hover:bg-red-700 rounded text-xs"
                      >
                        <X size={12} className="mr-1" />
                        Reject
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Context Menu */}
      {showContextMenu && (
        <div 
          className="fixed bg-gray-800 border border-gray-600 rounded-lg shadow-lg py-2 z-50"
          style={{ left: showContextMenu.x, top: showContextMenu.y }}
          onMouseLeave={() => setShowContextMenu(null)}
        >
          <button
            onClick={() => copyFilePath(showContextMenu.file.name)}
            className="block w-full text-left px-4 py-2 hover:bg-gray-700 text-sm"
          >
            <Copy size={12} className="inline mr-2" />
            Copy Path
          </button>
          <button
            onClick={() => {
              navigator.clipboard.writeText(showContextMenu.file.content || '');
              setTerminalHistory(prev => [...prev, 
                { type: 'system', content: `Copied content of: ${showContextMenu.file.name}` }
              ]);
              setShowContextMenu(null);
            }}
            className="block w-full text-left px-4 py-2 hover:bg-gray-700 text-sm"
          >
            <Copy size={12} className="inline mr-2" />
            Copy Content
          </button>
          <button
            onClick={() => deleteFile(showContextMenu.file.name)}
            className="block w-full text-left px-4 py-2 hover:bg-gray-700 text-sm text-red-400"
          >
            <Trash2 size={12} className="inline mr-2" />
            Delete
          </button>
        </div>
      )}

      {/* New File Dialog */}
      {showNewFileDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 border border-gray-600 rounded-lg p-6 w-96">
            <h3 className="text-lg font-semibold mb-4">Create New File</h3>
            <input
              type="text"
              value={newFileName}
              onChange={(e) => setNewFileName(e.target.value)}
              placeholder="filename
