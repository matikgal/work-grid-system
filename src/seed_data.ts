
import { createClient } from '@supabase/supabase-js';

// Hardcoded for script execution since we can't easily import from lib/supabase.ts in standalone script context without module setup
const supabaseUrl = 'https://bulommicnrltibxcnwdk.supabase.co';
// Need the real key if possible, but form user file it looks like a publishable key.
// Ideally I should import it, but ts-node/tsx might complain about modules.
// I'll try to use the one from the file I read.
const supabaseAnonKey = 'sb_publishable_6rofdGJ4sHjznnLFJHn5rw_PM8fO4sS';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

const FIRST_NAMES = ['Anna', 'Maria', 'Katarzyna', 'Małgorzata', 'Agnieszka', 'Barbara', 'Ewa', 'Krystyna', 'Elżbieta', 'Zofia', 'Jan', 'Andrzej', 'Piotr', 'Krzysztof', 'Stanisław', 'Tomasz', 'Paweł', 'Józef', 'Marcin', 'Marek', 'Michał', 'Grzegorz', 'Jerzy', 'Tadeusz', 'Adam', 'Łukasz', 'Zbigniew', 'Ryszard', 'Dariusz', 'Henryk'];
const LAST_NAMES = ['Nowak', 'Kowalski', 'Wiśniewski', 'Wójcik', 'Kowalczyk', 'Kamiński', 'Lewandowski', 'Zieliński', 'Szymański', 'Woźniak', 'Dąbrowski', 'Kozłowski', 'Jankowski', 'Mazur', 'Wojciechowski', 'Kwiatkowski', 'Krawczyk', 'Kaczmarek', 'Piotrowski', 'Grabowski'];

const ROLES = ['Kierownik', 'Kasa', 'Mięso', 'Mięso/Kasa', 'Pieczywo', 'Warzywa', 'Sprzątaczka'];

const SHIFT_TYPES = [
  { start: '06:00', end: '14:00', duration: 8, type: 'work' },
  { start: '14:00', end: '22:00', duration: 8, type: 'work' },
  { start: '07:00', end: '15:00', duration: 8, type: 'work' },
  { start: '08:00', end: '16:00', duration: 8, type: 'work' },
];

const COLORS = [
  'bg-red-500 text-white', 'bg-blue-500 text-white', 'bg-green-500 text-white', 
  'bg-yellow-500 text-black', 'bg-purple-500 text-white', 'bg-pink-500 text-white',
  'bg-indigo-500 text-white', 'bg-teal-500 text-white', 'bg-orange-500 text-white'
];

function getRandomElement<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

async function seed() {
  console.log('Starting seed process...');

  const newEmployees = [];

  // 1. Generate 20 Employees
  for (let i = 0; i < 20; i++) {
    const gender = Math.random() > 0.5 ? 'F' : 'M';
    // Simplified name picking
    const firstName = getRandomElement(FIRST_NAMES);
    const lastName = getRandomElement(LAST_NAMES);
    // Adjust last name for female roughly (simple heuristic for PL names)
    const finalLastName = (gender === 'F' && lastName.endsWith('ski')) ? lastName.replace('ski', 'ska') : lastName;
    const finalLastName2 = (gender === 'F' && finalLastName.endsWith('cki')) ? finalLastName.replace('cki', 'cka') : finalLastName;

    newEmployees.push({
      name: `${firstName} ${finalLastName2}`,
      role: getRandomElement(ROLES),
      avatar_color: getRandomElement(COLORS)
    });
  }

  console.log('Inserting employees...');
  const { data: insertedEmployees, error: empError } = await supabase
    .from('employees')
    .insert(newEmployees)
    .select();

  if (empError) {
    console.error('Error inserting employees:', empError);
    return;
  }

  console.log(`Inserted ${insertedEmployees.length} employees.`);

  // 2. Generate Shifts for December 2024
  const shifts = [];
  const daysInMonth = 31;
  const year = 2024;
  const month = 12; // December

  for (const emp of insertedEmployees) {
    for (let day = 1; day <= daysInMonth; day++) {
      // 50% chance of day off purely random + weekends logic simplified
      // Let's make it more realistic: ~20 working days
      
      const date = new Date(year, month - 1, day);
      const isSunday = date.getDay() === 0;
      const isSaturday = date.getDay() === 6;
      const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

      // Skip Sundays usually (Freshmarket might be open but let's assume reduced staff)
      if (isSunday && Math.random() > 0.2) continue;

      // Random chance to have a day off in week
      if (Math.random() > 0.3) { // 70% chance to NOT work on a specific day? No, lets invert.
         // Actually let's assume 5 days a week work approximately.
         // Probabilistic approach:
      }

      const shouldWork = Math.random() > (isSaturday ? 0.6 : 0.3); // Less chance to work on Sat, High chance on week days
      
      if (!shouldWork) {
         // Maybe add Vacation?
         if (Math.random() < 0.02) { // 2% chance for vacation day
            shifts.push({
                employee_id: emp.id,
                date: dateStr,
                start_time: '00:00',
                end_time: '00:00',
                duration: 8,
                type: 'vacation'
            });
         }
         continue;
      }

      // Holiday logic (24, 25, 26)
      if (day === 24) {
         // wigilia - reduced hours
         shifts.push({
            employee_id: emp.id,
            date: dateStr,
            start_time: '06:00',
            end_time: '14:00',
            duration: 8,
            type: 'work'
         });
         continue;
      }
      if (day === 25 || day === 26) {
         // holidays - mostly off
         if (Math.random() > 0.1) continue; // 10% chance to work
      }

      const template = getRandomElement(SHIFT_TYPES);

      shifts.push({
        employee_id: emp.id,
        date: dateStr,
        start_time: template.start,
        end_time: template.end,
        duration: template.duration,
        type: template.type
      });
    }
  }

  console.log(`Generating ${shifts.length} shifts...`);
  
  // Insert in chunks to avoid payload limits
  const chunkSize = 100;
  for (let i = 0; i < shifts.length; i += chunkSize) {
    const chunk = shifts.slice(i, i + chunkSize);
    const { error: shiftError } = await supabase.from('shifts').insert(chunk);
    if (shiftError) console.error('Error inserting chunk:', shiftError);
  }

  console.log('Finished seeding!');
}

seed();
