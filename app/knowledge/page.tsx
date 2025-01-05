'use client';

import { useState } from "react";
import Button from "@/components/ui/Button/Button"; // Correct path to your Button component
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Table, TableHeader, TableRow, TableCell, TableBody } from "@/components/ui/Table"; // Assuming you have these components
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { IconFilter } from "@/components/icons/IconFilter"; // Replace with your filter icon component
import { Pagination } from "@/components/ui/Pagination"; // Assuming you have a pagination component
import { ImportWebsiteModal } from '@/components/ImportWebsiteModal'; // Import the Modal component

export default function KnowledgePage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [showFilter, setShowFilter] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleImportWebsite = (url: string) => {
    console.log('Importing website from:', url);
    // Add your website scraping logic here
  };

  return (
    <div className="min-h-screen bg-gray-900 dark:text-white p-6 lg:p-8">
      <header className="flex flex-col lg:flex-row lg:items-center justify-between mb-8">
        <h1 className="text-2xl font-bold">Knowledge</h1>
        <p className="text-gray-400 lg:mt-0 mt-2">
          Provide your AI Agent with your company's knowledge so it can automatically answer customers with accurate and relevant information.
        </p>
      </header>

      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center space-x-2">
          <Button variant="flat" className="text-gray-400">
            Add source
          </Button>
          <Button variant="flat" className="text-gray-400" onClick={() => setIsModalOpen(true)}>
            Import website
          </Button>
          <Button variant="flat" className="bg-purple-600 dark:text-white">
            Create article
          </Button>
        </div>
        <div className="flex items-center space-x-2">
          <Input
            placeholder="Search by article name"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-gray-800 dark:text-white"
          />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <div>
                <Button variant="flat" className="text-gray-400">
                  <IconFilter />
                </Button>
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-gray-800">
              <DropdownMenuItem>Filter 1</DropdownMenuItem>
              <DropdownMenuItem>Filter 2</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="bg-gray-800 rounded-lg shadow-md">
        <nav className="flex space-x-4 p-4 border-b border-gray-700">
          <Button variant="flat" className="text-white">
            Articles
          </Button>
          <Button variant="flat" className="text-gray-400">
            Sources
          </Button>
        </nav>

        <div className="p-4">
          <Table>
            <TableHeader>
              <TableRow>
                <TableCell>
                  <input type="checkbox" className="form-checkbox text-purple-600 bg-gray-900 border-gray-700" />
                </TableCell>
                <TableCell>Article name</TableCell>
                <TableCell>Availability</TableCell>
                <TableCell>Source</TableCell>
                <TableCell>Language</TableCell>
                <TableCell>Last edited</TableCell>
                <TableCell>Active</TableCell>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell>
                  <input type="checkbox" className="form-checkbox text-purple-600 bg-gray-900 border-gray-700" />
                </TableCell>
                <TableCell>About Us</TableCell>
                <TableCell>Everyone</TableCell>
                <TableCell>Created in Ada</TableCell>
                <TableCell>English</TableCell>
                <TableCell>Aug 21, 2024</TableCell>
                <TableCell>
                  <Switch checked={true} />
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>

          <div className="mt-4 flex justify-between items-center">
            <div>
              <label className="text-gray-400">25 Rows</label>
            </div>
            <Pagination totalResults={1} resultsPerPage={25} currentPage={1} />
          </div>
        </div>
      </div>

      {/* Modal for Import Website */}
      <ImportWebsiteModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleImportWebsite}
      />
    </div>
  );
}