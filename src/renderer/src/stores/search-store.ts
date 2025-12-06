import { UrlHistoryList } from '@/shared/types/history';
import { create } from 'zustand';

interface SearchStore {
  urlSearchInput: string;
  urlSearchResults: UrlHistoryList;
}

export const useSearchStore = create<SearchStore>(() => ({
  urlSearchInput: '',
  urlSearchResults: []
}));
