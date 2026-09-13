import api from './axios';

export const adminApi = {
  overview: () => api.get('/admin/overview').then((r) => r.data),
  chapterStats: () => api.get('/admin/stats/chapters').then((r) => r.data),

  listUsers: (params = {}) => api.get('/admin/users', { params }).then((r) => r.data),
  setUserRole: (id, role) => api.patch(`/admin/users/${id}/role`, { role }).then((r) => r.data),
  deleteUser: (id) => api.delete(`/admin/users/${id}`).then((r) => r.data),

  createExam: (payload) => api.post('/admin/exams', payload).then((r) => r.data),
  deleteExam: (id) => api.delete(`/admin/exams/${id}`).then((r) => r.data),
  createSubject: (payload) => api.post('/admin/subjects', payload).then((r) => r.data),
  deleteSubject: (id) => api.delete(`/admin/subjects/${id}`).then((r) => r.data),
  createChapter: (payload) => api.post('/admin/chapters', payload).then((r) => r.data),
  updateChapter: (id, payload) => api.patch(`/admin/chapters/${id}`, payload).then((r) => r.data),
  deleteChapter: (id) => api.delete(`/admin/chapters/${id}`).then((r) => r.data),

  listQuestions: (params = {}) => api.get('/admin/questions', { params }).then((r) => r.data),
  createQuestion: (payload) => api.post('/admin/questions', payload).then((r) => r.data),
  updateQuestion: (id, payload) => api.patch(`/admin/questions/${id}`, payload).then((r) => r.data),
  deleteQuestion: (id) => api.delete(`/admin/questions/${id}`).then((r) => r.data),
  bulkQuestions: (payload) => api.post('/admin/questions/bulk', payload).then((r) => r.data),
  importCsv: (file) => {
    const form = new FormData();
    form.append('file', file);
    return api.post('/admin/questions/import', form).then((r) => r.data);
  },
};

export const CSV_COLUMNS = [
  'examName', 'examSlug', 'subjectName', 'subjectSlug', 'chapterName', 'chapterSlug', 'orderIndex',
  'questionText', 'optionA', 'optionB', 'optionC', 'optionD', 'optionE',
  'correctOption', 'explanation', 'difficulty', 'year', 'tags',
];

export function csvTemplate() {
  const header = CSV_COLUMNS.join(',');
  const rows = [
    ['Class 11','class-11','Chemistry','chemistry','Some Basic Concepts of Chemistry','some-basic-concepts-of-chemistry','1','What is the SI unit of amount of substance?','Kilogram','Mole','Newton','Pascal','','B','Mole is the SI unit for amount of substance.','easy','2023','si-units;mole'],
    ['Class 11','class-11','Chemistry','chemistry','Some Basic Concepts of Chemistry','some-basic-concepts-of-chemistry','1','One mole of CO2 contains how many oxygen atoms?','2','4','6.022e23','12','','C','One mole of CO2 has 2 moles of oxygen atoms.','medium','2022','mole;avogadro'],
    ['Class 11','class-11','Chemistry','chemistry','Some Basic Concepts of Chemistry','some-basic-concepts-of-chemistry','1','Which law states mass is neither created nor destroyed in a chemical reaction?','Charles Law','Boyle Law','Conservation of Mass','Avogadro Law','','C','Law of Conservation of Mass by Lavoisier.','easy','2021','laws;conservation-of-mass'],
    ['Class 11','class-11','Chemistry','chemistry','Structure of Atom','structure-of-atom','2','Who proposed the nuclear model of the atom?','Thomson','Rutherford','Bohr','Dalton','','B','Rutherford proposed the nuclear model after gold foil experiment.','easy','2022','atomic-model;rutherford'],
    ['Class 11','class-11','Chemistry','chemistry','Structure of Atom','structure-of-atom','2','The maximum number of electrons in the M shell (n=3) is:','2','8','18','32','','C','Maximum electrons = 2n^2 = 2(3)^2 = 18.','medium','2023','electron-config;shells'],
    ['Class 11','class-11','Chemistry','chemistry','Structure of Atom','structure-of-atom','2','Which quantum number describes the shape of an orbital?','Principal','Azimuthal','Magnetic','Spin','','B','The azimuthal quantum number (l) determines the orbital shape.','medium','2024','quantum-numbers;orbitals'],
    ['Class 11','class-11','Biology','biology','Cell Structure and Function','cell-structure-and-function','1','Which organelle is known as the powerhouse of the cell?','Nucleus','Golgi apparatus','Mitochondria','Ribosome','','C','Mitochondria produce ATP through cellular respiration.','easy','2023','cell-organelles;mitochondria'],
    ['Class 11','class-11','Biology','biology','Cell Structure and Function','cell-structure-and-function','1','Which is found in plant cells but not animal cells?','Ribosome','Chloroplast','Lysosome','Golgi apparatus','','B','Chloroplasts are present only in plant cells for photosynthesis.','easy','2022','cell-biology;plant-cells'],
    ['Class 11','class-11','Biology','biology','Cell Structure and Function','cell-structure-and-function','1','The fluid mosaic model of the cell membrane was proposed by?','Singer and Nicolson','Golgi and Palade','Watson and Crick','Hooke and Leeuwenhoek','','A','Singer and Nicolson proposed the fluid mosaic model in 1972.','medium','2021','cell-membrane;models'],
    ['Class 12','class-12','Chemistry','chemistry','Solutions','solutions','1','Which colligative property depends on the number of solute particles?','Boiling point elevation','Freezing point depression','Relative lowering of vapour pressure','All of the above','','D','All colligative properties depend on the number of solute particles.','easy','2023','colligative;solutions'],
    ['Class 12','class-12','Chemistry','chemistry','Solutions','solutions','1','The unit of molality is:','Molarity','Molal','Kilogram per mole','Mole per kilogram','','D','Molality = moles of solute / kg of solvent, measured in mol/kg.','medium','2022','molality;concentration'],
    ['Class 12','class-12','Chemistry','chemistry','Electrochemistry','electrochemistry','2','Which device converts chemical energy into electrical energy?','Galvanic cell','Electrolytic cell','Transformer','Generator','','A','A galvanic cell uses spontaneous redox reactions to generate electricity.','easy','2023','electrochemistry;galvanic'],
    ['Class 12','class-12','Chemistry','chemistry','Electrochemistry','electrochemistry','2','Standard electrode potential of hydrogen electrode is:','1V','-1V','0V','0.5V','','C','The Standard Hydrogen Electrode (SHE) has a potential defined as 0V.','medium','2021','electrochemistry;SHE'],
    ['Class 12','class-12','Biology','biology','Reproduction in Organisms','reproduction-in-organisms','1','Which type of reproduction produces genetically identical offspring?','Sexual reproduction','Asexual reproduction','Both','Neither','','B','Asexual reproduction involves a single parent and produces clones.','easy','2023','reproduction;asexual'],
    ['Class 12','class-12','Biology','biology','Reproduction in Organisms','reproduction-in-organisms','1','Binary fission is a method of:','Sexual reproduction','Asexual reproduction','Gametogenesis','Sporulation','','B','Binary fission is asexual reproduction where the cell divides into two.','easy','2022','fission;asexual'],
    ['Class 12','class-12','Biology','biology','Reproduction in Organisms','reproduction-in-organisms','1','In which organism does regeneration occur most prominently?','Hydra','Amoeba','Paramecium','Euglena','','A','Hydra can regenerate entire body parts from fragments.','medium','2024','regeneration;hydra'],
  ];

  const escape = (v) => {
    const s = String(v ?? '');
    return s.includes(',') || s.includes('"') || s.includes('\n') ? `"${s.replace(/"/g, '""')}"` : s;
  };

  const lines = [header, ...rows.map((r) => r.map(escape).join(','))];
  return `${lines.join('\n')}\n`;
}
