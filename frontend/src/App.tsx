import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Search, Filter, Eye, ArrowUpDown, Share2, Download, Upload, Plus, MoreHorizontal, X, Calendar, User, CheckCircle, AlertCircle, Clock, XCircle, } from 'lucide-react';

interface SpreadsheetRow {
  id: number;
  jobRequest: string;
  submitted: string;
  status: 'In-process' | 'Need to start' | 'Complete' | 'Blocked';
  submitter: string;
  url: string;
  assigned: string;
  priority: 'Medium' | 'High' | 'Low';
  dueDate: string;
  estValue: string;
}

interface CellPosition {
  row: number;
  col: string;
  colIndex: number;
}

interface FilterConfig {
  status: string[];
  priority: string[];
  submitter: string[];
  assigned: string[];
  dateRange: {
    start: string;
    end: string;
  };
}

const mockData: SpreadsheetRow[] = [
  {
    id: 1,
    jobRequest: 'Launch social media campaign for pro...',
    submitted: '15-11-2024',
    status: 'In-process',
    submitter: 'Aisha Patel',
    url: 'www.aishapatel...',
    assigned: 'Sophie Choudhury',
    priority: 'Medium',
    dueDate: '20-11-2024',
    estValue: '6,200,000',
  },
  {
    id: 2,
    jobRequest: 'Update press kit for company redesign',
    submitted: '28-10-2024',
    status: 'Need to start',
    submitter: 'Irfan Khan',
    url: 'www.irfankhap...',
    assigned: 'Tejas Pandey',
    priority: 'High',
    dueDate: '30-10-2024',
    estValue: '3,500,000',
  },
  {
    id: 3,
    jobRequest: 'Finalize user testing feedback for app...',
    submitted: '05-12-2024',
    status: 'In-process',
    submitter: 'Mark Johnson',
    url: 'www.markjohns...',
    assigned: 'Rachel Lee',
    priority: 'Medium',
    dueDate: '10-12-2024',
    estValue: '4,750,000',
  },
  {
    id: 4,
    jobRequest: 'Design new features for the website',
    submitted: '10-01-2025',
    status: 'Complete',
    submitter: 'Emily Green',
    url: 'www.emilygreen...',
    assigned: 'Tom Wright',
    priority: 'Low',
    dueDate: '15-01-2025',
    estValue: '5,900,000',
  },
  {
    id: 5,
    jobRequest: 'Prepare financial report for Q4',
    submitted: '25-01-2025',
    status: 'Blocked',
    submitter: 'Jessica Brown',
    url: 'www.jessicabro...',
    assigned: 'Kevin Smith',
    priority: 'Low',
    dueDate: '30-01-2025',
    estValue: '2,800,000',
  },
];

const COLUMNS = [
  { key: 'id', label: '#', width: 'w-16', editable: false },
  { key: 'jobRequest', label: 'Job Request', width: 'w-64', editable: true },
  { key: 'submitted', label: 'Submitted', width: 'w-32', editable: true },
  { key: 'status', label: 'Status', width: 'w-32', editable: true },
  { key: 'submitter', label: 'Submitter', width: 'w-36', editable: true },
  { key: 'url', label: 'URL', width: 'w-36', editable: true },
  { key: 'assigned', label: 'Assigned', width: 'w-36', editable: true },
  { key: 'priority', label: 'Priority', width: 'w-24', editable: true },
  { key: 'dueDate', label: 'Due Date', width: 'w-32', editable: true },
  { key: 'estValue', label: 'Est. Value', width: 'w-32', editable: true },
];

const STATUS_OPTIONS = ['In-process', 'Need to start', 'Complete', 'Blocked'];
const PRIORITY_OPTIONS = ['High', 'Medium', 'Low'];

const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const getStatusStyles = (status: string) => {
    switch (status) {
      case 'In-process':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Need to start':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Complete':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'Blocked':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'In-process':
        return <Clock className="w-3 h-3" />;
      case 'Need to start':
        return <AlertCircle className="w-3 h-3" />;
      case 'Complete':
        return <CheckCircle className="w-3 h-3" />;
      case 'Blocked':
        return <XCircle className="w-3 h-3" />;
      default:
        return null;
    }
  };

  return (
    <span
      className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium border space-x-1 ${getStatusStyles(
        status
      )}`}
    >
      {getStatusIcon(status)}
      <span>{status}</span>
    </span>
  );
};

const PriorityBadge: React.FC<{ priority: string }> = ({ priority }) => {
  const getPriorityStyles = (priority: string) => {
    switch (priority) {
      case 'High':
        return 'bg-red-100 text-red-800';
      case 'Medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'Low':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <span
      className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium ${getPriorityStyles(
        priority
      )}`}
    >
      {priority}
    </span>
  );
};

const FilterPanel: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  filters: FilterConfig;
  onFiltersChange: (filters: FilterConfig) => void;
  data: SpreadsheetRow[];
}> = ({ isOpen, onClose, filters, onFiltersChange, data }) => {
  if (!isOpen) return null;

  const uniqueSubmitters = [...new Set(data.map(row => row.submitter))];

  const handleFilterChange = (key: keyof FilterConfig, value: FilterConfig[keyof FilterConfig]) => {
    onFiltersChange({
      ...filters,
      [key]: value,
    });
  };

  const handleArrayToggle = (key: 'status' | 'priority' | 'submitter' | 'assigned', value: string) => {
    const currentArray = filters[key];
    const newArray = currentArray.includes(value)
      ? currentArray.filter(item => item !== value)
      : [...currentArray, value];
    
    handleFilterChange(key, newArray);
  };

  const clearFilters = () => {
    onFiltersChange({
      status: [],
      priority: [],
      submitter: [],
      assigned: [],
      dateRange: { start: '', end: '' },
    });
  };

  return (
    <div className="absolute top-full left-0 mt-1 w-80 bg-white border border-gray-200 rounded-lg shadow-lg z-20">
      <div className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-medium text-gray-900">Filter Options</h3>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-4">
          {/* Status Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
            <div className="space-y-2">
              {STATUS_OPTIONS.map(status => (
                <label key={status} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={filters.status.includes(status)}
                    onChange={() => handleArrayToggle('status', status)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">{status}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Priority Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
            <div className="space-y-2">
              {PRIORITY_OPTIONS.map(priority => (
                <label key={priority} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={filters.priority.includes(priority)}
                    onChange={() => handleArrayToggle('priority', priority)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">{priority}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Submitter Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Submitter</label>
            <div className="space-y-2 max-h-24 overflow-y-auto">
              {uniqueSubmitters.map(submitter => (
                <label key={submitter} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={filters.submitter.includes(submitter)}
                    onChange={() => handleArrayToggle('submitter', submitter)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">{submitter}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Date Range Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Date Range</label>
            <div className="space-y-2">
              <input
                type="date"
                value={filters.dateRange.start}
                onChange={(e) => handleFilterChange('dateRange', { ...filters.dateRange, start: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Start date"
              />
              <input
                type="date"
                value={filters.dateRange.end}
                onChange={(e) => handleFilterChange('dateRange', { ...filters.dateRange, end: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="End date"
              />
            </div>
          </div>

          {/* Clear Filters Button */}
          <button
            onClick={clearFilters}
            className="w-full px-3 py-2 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-md transition-colors"
          >
            Clear All Filters
          </button>
        </div>
      </div>
    </div>
  );
};

export default function SpreadsheetView() {
  const [selectedCell, setSelectedCell] = useState<CellPosition | null>(null);
  const [activeTab, setActiveTab] = useState('All Orders');
  const [data, setData] = useState(mockData);
  const [editingCell, setEditingCell] = useState<CellPosition | null>(null);
  const [editValue, setEditValue] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortConfig, setSortConfig] = useState<{
    key: string;
    direction: 'asc' | 'desc';
  } | null>(null);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filters, setFilters] = useState<FilterConfig>({
    status: [],
    priority: [],
    submitter: [],
    assigned: [],
    dateRange: { start: '', end: '' },
  });
  const [hiddenColumns, setHiddenColumns] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const selectRef = useRef<HTMLSelectElement>(null);

  const getCellValue = useCallback((row: number, col: string): string => {
    const dataRow = data.find((item) => item.id === row);
    if (!dataRow) return '';
    
    const value = dataRow[col as keyof SpreadsheetRow];
    return String(value);
  }, [data]);

  const handleCellClick = useCallback((row: number, col: string, colIndex: number) => {
    const column = COLUMNS.find(c => c.key === col);
    if (!column?.editable && col !== 'id') return;
    
    setSelectedCell({ row, col, colIndex });
    setEditingCell(null);
  }, []);

  const handleCellDoubleClick = useCallback(
    (row: number, col: string, colIndex: number, currentValue: string) => {
      const column = COLUMNS.find(c => c.key === col);
      if (!column?.editable) return;
      
      setEditingCell({ row, col, colIndex });
      setEditValue(currentValue);
      setSelectedCell({ row, col, colIndex });
    },
    []
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (!selectedCell) return;
      if (editingCell) return; // Don't handle navigation while editing

      const { row, colIndex } = selectedCell;
      const visibleColumns = COLUMNS.filter(col => !hiddenColumns.includes(col.key));
      const maxRow = Math.max(data.length, 25);
      let newRow = row;
      let newColIndex = colIndex;

      switch (e.key) {
        case 'ArrowUp':
          e.preventDefault();
          newRow = Math.max(1, row - 1);
          break;
        case 'ArrowDown':
          e.preventDefault();
          newRow = Math.min(maxRow, row + 1);
          break;
        case 'ArrowLeft':
          e.preventDefault();
          newColIndex = Math.max(0, colIndex - 1);
          break;
        case 'ArrowRight':
          e.preventDefault();
          newColIndex = Math.min(visibleColumns.length - 1, colIndex + 1);
          break;
        case 'Enter':
          e.preventDefault();
          {
            const currentValue = getCellValue(row, visibleColumns[colIndex].key);
            handleCellDoubleClick(row, visibleColumns[colIndex].key, colIndex, currentValue);
          }
          break;
        case 'Delete':
        case 'Backspace':
          e.preventDefault();
          if (row <= data.length) {
            const column = visibleColumns[colIndex];
            if (column.editable) {
              handleCellDoubleClick(row, column.key, colIndex, '');
            }
          }
          break;
        default:
          // Start editing if a printable character is pressed
          if (e.key.length === 1 && !e.ctrlKey && !e.altKey && !e.metaKey) {
            e.preventDefault();
            const column = visibleColumns[colIndex];
            if (column.editable && row <= data.length) {
              setEditingCell({ row, col: column.key, colIndex });
              setEditValue(e.key);
            }
          }
          return;
      }

      if (e.key.startsWith('Arrow')) {
        setSelectedCell({
          row: newRow,
          col: visibleColumns[newColIndex].key,
          colIndex: newColIndex,
        });
      }
    },
    [selectedCell, editingCell, handleCellDoubleClick, data.length, hiddenColumns, getCellValue]
  );

  const handleSaveEdit = useCallback(() => {
    if (!editingCell) return;

    const { row, col } = editingCell;
    
    // Add new row if editing beyond current data
    if (row > data.length) {
      const newRow: SpreadsheetRow = {
        id: row,
        jobRequest: '',
        submitted: '',
        status: 'Need to start',
        submitter: '',
        url: '',
        assigned: '',
        priority: 'Medium',
        dueDate: '',
        estValue: '',
      };
      setData(prev => [...prev, newRow]);
    }
    
    setData((prevData) =>
      prevData.map((item) =>
        item.id === row
          ? { ...item, [col]: editValue }
          : item
      )
    );
    
    setEditingCell(null);
  }, [editingCell, editValue, data.length]);

  const handleSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'asc';
    
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    
    setSortConfig({ key, direction });
    
    const sortedData = [...data].sort((a, b) => {
      const aValue = a[key as keyof SpreadsheetRow];
      const bValue = b[key as keyof SpreadsheetRow];
      
      // Handle numeric values
      if (key === 'estValue') {
        const aNum = parseInt(String(aValue).replace(/[^\d]/g, ''));
        const bNum = parseInt(String(bValue).replace(/[^\d]/g, ''));
        return direction === 'asc' ? aNum - bNum : bNum - aNum;
      }
      
      // Handle dates
      if (key === 'submitted' || key === 'dueDate') {
        const aDate = new Date(String(aValue).split('-').reverse().join('-'));
        const bDate = new Date(String(bValue).split('-').reverse().join('-'));
        return direction === 'asc' ? aDate.getTime() - bDate.getTime() : bDate.getTime() - aDate.getTime();
      }
      
      if (direction === 'asc') {
        return String(aValue).localeCompare(String(bValue));
      }
      return String(bValue).localeCompare(String(aValue));
    });
    
    setData(sortedData);
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const handleToolbarAction = (action: string) => {
    switch (action) {
      case 'hide-fields': {
        // Toggle column visibility
        const currentlyHidden = hiddenColumns.length > 0;
        if (currentlyHidden) {
          setHiddenColumns([]);
        } else {
          setHiddenColumns(['url', 'submitted']); // Hide some columns as example
        }
        break;
      }
      case 'filter':
        setIsFilterOpen(!isFilterOpen);
        break;
      case 'import': {
        // Create a file input element
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.csv,.json';
        input.onchange = (e) => {
          const file = (e.target as HTMLInputElement).files?.[0];
          if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
              try {
                const content = e.target?.result as string;
                if (file.name.endsWith('.json')) {
                  const jsonData = JSON.parse(content);
                  setData(jsonData);
                } else {
                  // Simple CSV parsing
                  const lines = content.split('\n');
                  const newData = lines.slice(1).map((line, index) => {
                    const values = line.split(',');
                    return {
                      id: data.length + index + 1,
                      jobRequest: values[0] || '',
                      submitted: values[1] || '',
                      status: (values[2] as SpreadsheetRow['status']) || 'Need to start',
                      submitter: values[3] || '',
                      url: values[4] || '',
                      assigned: values[5] || '',
                      priority: (values[6] as SpreadsheetRow['priority']) || 'Medium',
                      dueDate: values[7] || '',
                      estValue: values[8] || '',
                    };
                  });
                  setData(prev => [...prev, ...newData]);
                }
              } catch {
                alert('Error parsing file');
              }
            };
            reader.readAsText(file);
          }
        };
        input.click();
        break;
      }
      case 'export': {
        const exportData = JSON.stringify(data, null, 2);
        const blob = new Blob([exportData], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'spreadsheet-data.json';
        a.click();
        URL.revokeObjectURL(url);
        break;
      }
      case 'share':
        navigator.clipboard.writeText(window.location.href);
        alert('Link copied to clipboard');
        break;
      case 'new-action': {
        const newId = Math.max(...data.map(d => d.id), 0) + 1;
        const newRow: SpreadsheetRow = {
          id: newId,
          jobRequest: 'New Job Request',
          submitted: new Date().toLocaleDateString('en-GB'),
          status: 'Need to start',
          submitter: 'New User',
          url: 'www.example.com',
          assigned: 'Unassigned',
          priority: 'Medium',
          dueDate: new Date().toLocaleDateString('en-GB'),
          estValue: '0',
        };
        setData(prev => [...prev, newRow]);
        break;
      }
      default:
        break;
    }
  };

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
  };

  useEffect(() => {
    if (editingCell && (inputRef.current || selectRef.current)) {
      const element = inputRef.current || selectRef.current;
      if (element) {
        element.focus();
        if (inputRef.current) {
          inputRef.current.select();
        }
      }
    }
  }, [editingCell]);

  const tabs = ['All Orders', 'Pending', 'Reviewed', 'Arrived'];
  const visibleColumns = COLUMNS.filter(col => !hiddenColumns.includes(col.key));

  // Apply filters and search
  const filteredData = data.filter((row) => {
    // Search filter
    const matchesSearch = searchQuery === '' || 
      Object.values(row).some((value) =>
        String(value).toLowerCase().includes(searchQuery.toLowerCase())
      );

    // Status filter
    const matchesStatus = filters.status.length === 0 || 
      filters.status.includes(row.status);

    // Priority filter
    const matchesPriority = filters.priority.length === 0 || 
      filters.priority.includes(row.priority);

    // Submitter filter
    const matchesSubmitter = filters.submitter.length === 0 || 
      filters.submitter.includes(row.submitter);

    // Date range filter
    const matchesDateRange = !filters.dateRange.start || !filters.dateRange.end ||
      (() => {
        const submittedDate = new Date(row.submitted.split('-').reverse().join('-'));
        const startDate = new Date(filters.dateRange.start);
        const endDate = new Date(filters.dateRange.end);
        return submittedDate >= startDate && submittedDate <= endDate;
      })();

    return matchesSearch && matchesStatus && matchesPriority && matchesSubmitter && matchesDateRange;
  });

  const renderCellContent = (row: SpreadsheetRow, column: typeof COLUMNS[0]) => {
    const isEditing = editingCell?.row === row.id && editingCell?.col === column.key;
    const cellValue = row[column.key as keyof SpreadsheetRow];

    if (isEditing) {
      if (column.key === 'status') {
        return (
          <select
            ref={selectRef}
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onBlur={handleSaveEdit}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleSaveEdit();
              } else if (e.key === 'Escape') {
                setEditingCell(null);
              }
            }}
            className="w-full bg-transparent border-none outline-none text-sm"
          >
            {STATUS_OPTIONS.map(option => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        );
      } else if (column.key === 'priority') {
        return (
          <select
            ref={selectRef}
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onBlur={handleSaveEdit}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleSaveEdit();
              } else if (e.key === 'Escape') {
                setEditingCell(null);
              }
            }}
            className="w-full bg-transparent border-none outline-none text-sm"
          >
            {PRIORITY_OPTIONS.map(option => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        );
      } else {
        return (
          <input
            ref={inputRef}
            type="text"
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onBlur={handleSaveEdit}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleSaveEdit();
              } else if (e.key === 'Escape') {
                setEditingCell(null);
              }
            }}
            className="w-full bg-transparent border-none outline-none text-sm"
          />
        );
      }
    }

    // Regular cell content
    if (column.key === 'id') {
      return <span className="text-gray-500 font-medium">{cellValue}</span>;
    } else if (column.key === 'status') {
      return <StatusBadge status={String(cellValue)} />;
    } else if (column.key === 'priority') {
      return <PriorityBadge priority={String(cellValue)} />;
    } else if (column.key === 'submitter' || column.key === 'assigned') {
      return (
        <button
          onClick={(e) => {
            e.stopPropagation();
            console.log(`${column.key} clicked: ${cellValue}`);
          }}
          className="text-blue-600 hover:underline flex items-center space-x-1"
        >
          <User className="w-3 h-3" />
          <span>{String(cellValue)}</span>
        </button>
      );
    } else if (column.key === 'url') {
      return (
        <button
          onClick={(e) => {
            e.stopPropagation();
            console.log(`URL clicked: ${cellValue}`);
          }}
          className="text-blue-600 hover:underline truncate"
        >
          {String(cellValue)}
        </button>
      );
    } else if (column.key === 'estValue') {
      return <span className="text-gray-900 font-medium">{cellValue} ₹</span>;
    } else if (column.key === 'dueDate' || column.key === 'submitted') {
      return (
        <span className="text-gray-600 flex items-center space-x-1">
          <Calendar className="w-3 h-3" />
          <span>{String(cellValue)}</span>
        </span>
      );
    } else {
      return <span className="text-gray-600">{String(cellValue)}</span>;
    }
  };
  return (
  <div 
    className="min-h-screen bg-gray-50" 
    tabIndex={0}
    onKeyDown={handleKeyDown}
  >
    {/* Header */}
    <div className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <button className="w-6 h-6 bg-blue-500 text-white rounded flex items-center justify-center hover:bg-blue-600">
            <span className="text-xs font-bold">W</span>
          </button>
          <button className="hover:text-blue-600">Workspace</button>
          <span>&gt;</span>
          <button className="hover:text-blue-600">Folder 2</button>
          <span>&gt;</span>
          <span className="text-gray-900 font-medium">Spreadsheet</span>
        </div>
        
        <div className="flex items-center space-x-4">
          <button 
            onClick={() => handleToolbarAction('share')}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center space-x-2"
          >
            <Share2 className="w-4 h-4" />
            <span>Share</span>
          </button>
        </div>
      </div>
    </div>

    {/* Tabs */}
    <div className="bg-white border-b border-gray-200 px-6">
      <div className="flex space-x-8">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => handleTabChange(tab)}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === tab
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>
    </div>

    {/* Toolbar */}
    <div className="bg-white border-b border-gray-200 px-6 py-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <div className="relative">
            <button
              onClick={() => handleToolbarAction('filter')}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-md"
            >
              <Filter className="w-4 h-4" />
            </button>
            <FilterPanel
              isOpen={isFilterOpen}
              onClose={() => setIsFilterOpen(false)}
              filters={filters}
              onFiltersChange={setFilters}
              data={data}
            />
          </div>
          
          <button
            onClick={() => handleToolbarAction('hide-fields')}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-md"
          >
            <Eye className="w-4 h-4" />
          </button>
          
          <button
            onClick={() => handleToolbarAction('sort')}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-md"
            title="Sort options"
          >
            <ArrowUpDown className="w-4 h-4" />
          </button>
        </div>

        <div className="flex items-center space-x-2">
          Import
          <button
            onClick={() => handleToolbarAction('import')}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-md"
            
          >
            <Upload className="w-4 h-4" />
          </button>
          
          <button
            onClick={() => handleToolbarAction('export')}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-md"
          >
            <Download className="w-4 h-4" />
          </button>
          
          <button
            onClick={() => handleToolbarAction('new-action')}
            className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>New</span>
          </button>
          
          <button
            onClick={() => handleToolbarAction('more')}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-md"
            title="More options"
          >
            <MoreHorizontal className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>

    {/* Spreadsheet */}
    <div className="flex-1 overflow-auto">
      <div className="min-w-max">
        {/* Header Row */}
        <div className="bg-gray-50 border-b border-gray-200 sticky top-0 z-10">
          <div className="flex">
            {visibleColumns.map((column) => (
              <div
                key={column.key}
                className={`${column.width} px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200 cursor-pointer hover:bg-gray-100`}
                onClick={() => handleSort(column.key)}
              >
                <div className="flex items-center justify-between">
                  <span>{column.label}</span>
                  {sortConfig?.key === column.key && (
                    <ArrowUpDown className="w-3 h-3" />
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Data Rows */}
        <div className="bg-white">
          {filteredData.map((row) => (
            <div
              key={row.id}
              className={`flex border-b border-gray-200 hover:bg-gray-50 ${
                selectedCell?.row === row.id ? 'bg-blue-50' : ''
              }`}
            >
              {visibleColumns.map((column) => (
              <div
                key={`${row.id}-${column.key}`}
                className={`${column.width} px-4 py-3 text-sm border-r border-gray-200 cursor-pointer ${
                  selectedCell?.row === row.id && selectedCell?.col === column.key
                    ? 'ring-2 ring-blue-500 bg-blue-100'
                    : ''
                }`}
                onClick={() => handleCellClick(row.id, column.key, visibleColumns.indexOf(column))}
                onDoubleClick={() => handleCellDoubleClick(row.id, column.key, visibleColumns.indexOf(column), String(row[column.key as keyof SpreadsheetRow]))}
              >
                  {renderCellContent(row, column)}
                </div>
              ))}
            </div>
          ))}
          
          {/* Empty rows for additional space */}
          {Array.from({ length: Math.max(0, 25 - filteredData.length) }).map((_, index) => {
            const rowNum = filteredData.length + index + 1;
            return (
              <div
                key={`empty-${rowNum}`}
                className={`flex border-b border-gray-200 hover:bg-gray-50 ${
                  selectedCell?.row === rowNum ? 'bg-blue-50' : ''
                }`}
              >
                {visibleColumns.map((column, colIndex) => (
                  <div
                    key={`${rowNum}-${column.key}`}
                    className={`${column.width} px-4 py-3 text-sm border-r border-gray-200 cursor-pointer ${
                      selectedCell?.row === rowNum && selectedCell?.col === column.key
                        ? 'ring-2 ring-blue-500 bg-blue-100'
                        : ''
                    }`}
                    onClick={() => handleCellClick(rowNum, column.key, colIndex)}
                    onDoubleClick={() => handleCellDoubleClick(rowNum, column.key, colIndex, '')}
                  >
                    {editingCell?.row === rowNum && editingCell?.col === column.key ? (
                      column.key === 'status' ? (
                        <select
                          ref={selectRef}
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          onBlur={handleSaveEdit}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              handleSaveEdit();
                            } else if (e.key === 'Escape') {
                              setEditingCell(null);
                            }
                          }}
                          className="w-full bg-transparent border-none outline-none text-sm"
                        >
                          {STATUS_OPTIONS.map(option => (
                            <option key={option} value={option}>{option}</option>
                          ))}
                        </select>
                      ) : column.key === 'priority' ? (
                        <select
                          ref={selectRef}
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          onBlur={handleSaveEdit}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              handleSaveEdit();
                            } else if (e.key === 'Escape') {
                              setEditingCell(null);
                            }
                          }}
                          className="w-full bg-transparent border-none outline-none text-sm"
                        >
                          {PRIORITY_OPTIONS.map(option => (
                            <option key={option} value={option}>{option}</option>
                          ))}
                        </select>
                      ) : (
                        <input
                          ref={inputRef}
                          type="text"
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          onBlur={handleSaveEdit}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              handleSaveEdit();
                            } else if (e.key === 'Escape') {
                              setEditingCell(null);
                            }
                          }}
                          className="w-full bg-transparent border-none outline-none text-sm"
                        />
                      )
                    ) : (
                      column.key === 'id' ? (
                        <span className="text-gray-400">{rowNum}</span>
                      ) : null
                    )}
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      </div>
    </div>

    {/* Status Bar */}
    <div className="bg-white border-t border-gray-200 px-6 py-2">
      <div className="flex items-center justify-between text-sm text-gray-600">
        <div className="flex items-center space-x-4">
          <span>{filteredData.length} rows</span>
          <span>{visibleColumns.length} columns</span>
          {selectedCell && (
            <span>
              Selected: {selectedCell.col.toUpperCase()}{selectedCell.row}
            </span>
          )}
        </div>
        <div className="flex items-center space-x-2">
          <span>Zoom: 100%</span>
          <input 
            type="range" 
            min="50" 
            max="200" 
            defaultValue="100" 
            className="w-16 h-1 bg-gray-200 rounded appearance-none cursor-pointer"
            onChange={(e) => console.log('Zoom changed:', e.target.value)}
          />
        </div>
      </div>
    </div>
  </div>
);
}