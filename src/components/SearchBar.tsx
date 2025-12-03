'use client';

import { useState } from 'react';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import SearchIcon from '@mui/icons-material/Search';

interface SearchBarProps {
  onSearch: (search: string) => void;
}

export default function SearchBar({ onSearch }: SearchBarProps) {
  const [search, setSearch] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(search);
  };

  return (
    <Stack component="form" onSubmit={handleSubmit} direction="row" spacing={2}>
      <TextField
        type="text"
        placeholder="Search companies, emails, websites..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        sx={{ minWidth: 256 }}
      />
      <Button
        type="submit"
        variant="contained"
        startIcon={<SearchIcon />}
      >
        Search
      </Button>
    </Stack>
  );
}