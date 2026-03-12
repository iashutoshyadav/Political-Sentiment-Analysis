export const PARTY_COLORS = {
    BJP: { primary: '#FF6B00', light: '#FF6B0020' },
    INC: { primary: '#138AE3', light: '#138AE320' },
    AAP: { primary: '#00B0F0', light: '#00B0F020' },
    SP: { primary: '#FF2222', light: '#FF222220' },
    BSP: { primary: '#0000EE', light: '#0000EE20' },
    TMC: { primary: '#00AA00', light: '#00AA0020' },
    NCP: { primary: '#007FFF', light: '#007FFF20' },
    SS: { primary: '#FF7700', light: '#FF770020' },
    'CPI(M)': { primary: '#CC0000', light: '#CC000020' },
    JDU: { primary: '#005EAA', light: '#005EAA20' },
    RJD: { primary: '#00AA44', light: '#00AA4420' },
    TRS: { primary: '#E91E63', light: '#E91E6320' },
    TDP: { primary: '#FFD700', light: '#FFD70020' },
    DMK: { primary: '#CC0000', light: '#CC000020' },
    AIADMK: { primary: '#006400', light: '#00640020' },
};

export function getPartyColor(party) {
    return PARTY_COLORS[party]?.primary || '#3b82f6';
}

export function getSentimentColor(label) {
    const map = { Positive: '#22c55e', Neutral: '#f59e0b', Negative: '#ef4444' };
    return map[label] || '#64748b';
}
