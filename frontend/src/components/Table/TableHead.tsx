import { ChevronsUpDown } from 'lucide-react';

interface TableHeadProps {
  hasCollapsibleContent?: boolean;
  columns: {
    title: string;
    id?: string;
    srOnly?: boolean;
    sortable?: boolean;
  }[];
  handleSort: (column: string) => void; // Pass the sort function as a prop
  checked: boolean;
  onChange: () => void;
}

const TableHead = ({
  hasCollapsibleContent,
  columns,
  handleSort,
  checked,
  onChange,
}: TableHeadProps) => {
  // const [sortColumn, setSortColumn] = useState('');
  // const [sortOrder, setSortOrder] = useState('asc');
  // const [sortBy, setSortBy] = useState('_id'); // Default sorting by ID

  // const handleSort = (column: string) => {
  //   setSortColumn(column);
  //   setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
  // };

  return (
    <thead className='text-xs text-white uppercase bg-vesoko_dark_blue hover:cursor-pointer dark:bg-gray-700 dark:text-gray-400'>
      <tr>
        <th className='px-6 py-3'>
          <input type='checkbox' checked={checked} onChange={onChange} />
        </th>
        {columns.map((column) => (
          <th
            key={column.title}
            scope='col'
            className={`px-6 py-3 ${column.srOnly ? 'sr-only' : ''}`}
            onClick={() => {
              if (column.sortable) {
                handleSort(`${column.id}`); // Handle cases where id might be missing
              }
            }}
          >
            <span className='flex items-center'>
              {column.title}
              {column.sortable && <ChevronsUpDown className='w-3 h-3 ms-1' />}
            </span>
          </th>
        ))}
        {hasCollapsibleContent && (
          <td className='px-6 py-3 text-right'>
            <span>▲▼</span>
            {/* {isExpanded ? '▲' : '▼'} */}
          </td>
        )}
      </tr>
    </thead>
  );
};

export default TableHead;
