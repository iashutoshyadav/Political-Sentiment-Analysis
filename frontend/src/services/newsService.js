import api from './api';

export const newsService = {
    fetchNews: (party, state, pageSize = 15) =>
        api.get('/news/fetch', { params: { party, state, page_size: pageSize } }).then(r => r.data),
};
