// Reusable maintenance task templates for the demo.
// Keep this file framework-agnostic; simple data exports only.

const TEMPLATES = [
  {
    id: 'tmpl_treadmill_lube',
    title: 'Treadmill Lubrication',
    steps: [
      { title: 'Gather silicone oil and cloths' },
      { title: 'Power off treadmill and unplug' },
      { title: 'Apply oil under belt evenly' },
      { title: 'Run treadmill at low speed for 2 minutes' },
      { title: 'Wipe excess and restore power' },
    ],
  },
  {
    id: 'tmpl_air_filter_replace',
    title: 'Air Filter Replacement',
    steps: [
      { title: 'Retrieve correct filter' },
      { title: 'Power down HVAC zone' },
      { title: 'Remove old filter safely' },
      { title: 'Install new filter with proper airflow direction' },
      { title: 'Document change date/next due date' },
    ],
  },
  {
    id: 'tmpl_weight_machine_inspect',
    title: 'Weight Machine Inspection',
    steps: [
      { title: 'Check cables for fray or damage' },
      { title: 'Inspect pulleys and bearings' },
      { title: 'Tighten loose fasteners' },
      { title: 'Test motion smoothly through range' },
    ],
  },
];

export function getTemplates() {
  return TEMPLATES.map((t) => ({ ...t }));
}

export function getTemplateById(id) {
  const found = TEMPLATES.find((t) => t.id === id);
  return found ? { ...found, steps: found.steps.map((s) => ({ ...s })) } : null;
}

