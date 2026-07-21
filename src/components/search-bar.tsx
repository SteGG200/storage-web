'use client';

import { useEffect, useState } from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';

interface SearchBarProps {
	onSearch: (query: string) => void;
}

export function SearchBar({ onSearch }: SearchBarProps) {
	const [value, setValue] = useState('');

	useEffect(() => {
		const timer = setTimeout(() => {
			onSearch(value);
		}, 300); // 300ms debounce

		return () => clearTimeout(timer);
	}, [value, onSearch]);

	return (
		<div className="relative flex-1 max-w-lg">
			<Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
			<Input
				type="text"
				placeholder="Search files and folders..."
				value={value}
				onChange={(e) => setValue(e.target.value)}
				className="w-full pl-9 pr-4 h-10 bg-[#131b2e] border-slate-700 text-slate-200 placeholder:text-slate-500 focus-visible:ring-blue-500"
			/>
		</div>
	);
}
