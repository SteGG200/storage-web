'use client';

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import {
	Breadcrumb,
	BreadcrumbItem,
	BreadcrumbLink,
	BreadcrumbList,
	BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Button } from '@/components/ui/button';

interface PathBreadcrumbProps {
	currentPath: string;
}

export function PathBreadcrumb({ currentPath }: PathBreadcrumbProps) {
	const segments = currentPath ? currentPath.split('/') : [];

	// Compute parent path for Back button
	const getParentPath = () => {
		if (segments.length <= 1) return '/';
		return '/' + segments.slice(0, -1).join('/');
	};

	const isRoot = segments.length === 0;

	return (
		<div className="flex items-center gap-4 py-2">
			{isRoot ? (
				<Button
					variant="outline"
					size="sm"
					className="h-9 px-3 gap-1 bg-[#131b2e] border-slate-700 text-slate-400 cursor-not-allowed"
					disabled
				>
					<ArrowLeft className="size-4" />
					Back
				</Button>
			) : (
				<Link href={getParentPath()} passHref legacyBehavior>
					<Button
						variant="outline"
						size="sm"
						className="h-9 px-3 gap-1 bg-[#131b2e] border-slate-700 text-slate-300 hover:bg-[#1a233d] hover:text-white"
					>
						<ArrowLeft className="size-4" />
						Back
					</Button>
				</Link>
			)}

			<Breadcrumb>
				<BreadcrumbList className="text-slate-300 text-sm md:text-base">
					<BreadcrumbItem>
						<BreadcrumbLink
							render={
								<Link
									href="/"
									className="text-blue-400 hover:text-blue-300 font-medium"
								/>
							}
						>
							My Storage
						</BreadcrumbLink>
					</BreadcrumbItem>

					{segments.map((segment, idx) => {
						const href = '/' + segments.slice(0, idx + 1).join('/');
						const isLast = idx === segments.length - 1;

						return (
							<span key={idx} className="flex items-center gap-2">
								<BreadcrumbSeparator className="text-slate-500 font-normal">
									&gt;
								</BreadcrumbSeparator>
								<BreadcrumbItem>
									{isLast ? (
										<span className="text-slate-300 font-normal">
											{segment}
										</span>
									) : (
										<BreadcrumbLink
											render={
												<Link
													href={href}
													className="text-blue-400 hover:text-blue-300 font-medium"
												/>
											}
										>
											{segment}
										</BreadcrumbLink>
									)}
								</BreadcrumbItem>
							</span>
						);
					})}
				</BreadcrumbList>
			</Breadcrumb>
		</div>
	);
}
