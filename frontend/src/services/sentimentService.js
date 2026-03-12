import api from './api';

export const sentimentService = {
    analyze: (party, state, pageSize = 15) =>
        api.post('/sentiment/analyze', { party, state, page_size: pageSize }).then(r => r.data),

    getHistory: () =>
        api.get('/sentiment/history').then(r => r.data),

    getStats: () =>
        api.get('/sentiment/stats').then(r => r.data),

    generateReport: (analysisId, party, state) =>
        api.post('/report/generate', { analysis_id: analysisId, party, state }, { responseType: 'blob' }).then(r => r.data),
};
