// Comprehensive Gym Equipment Maintenance Instructions
// Based on industry standards and manufacturer guidelines

export const EQUIPMENT_TYPES = {
  TREADMILL: 'Treadmill',
  ELLIPTICAL: 'Elliptical',
  BIKE: 'Bike',
  ROWING_MACHINE: 'Rowing Machine',
  STAIRMASTER: 'StairMaster',
  BENCH_PRESS: 'Bench Press',
  SQUAT_RACK: 'Squat Rack',
  SMITH_MACHINE: 'Smith Machine',
  LEG_PRESS: 'Leg Press',
  CABLE_MACHINE: 'Cable Machine',
  BARBELLS: 'Barbells',
  GENERAL: 'General Equipment'
};

export const MAINTENANCE_INSTRUCTIONS = {
  // ==================== TREADMILL MAINTENANCE ====================
  'Treadmill Belt Lubrication': {
    equipment: EQUIPMENT_TYPES.TREADMILL,
    difficulty: 'Medium',
    timeRequired: '20-30 minutes',
    frequency: 'Every 3 months or 150 hours of use',
    tools: ['Treadmill lubricant (100% silicone oil)', 'Clean cloth', 'Vacuum cleaner'],
    safety: [
      'Unplug the treadmill before starting',
      'Ensure belt is completely stopped',
      'Wear non-slip shoes',
      'Never over-lubricate as this can cause slipping'
    ],
    steps: [
      {
        number: 1,
        title: 'Power Off and Unplug',
        description: 'Turn off the treadmill and unplug it from the power source. Wait 5 minutes for capacitors to discharge.',
        warning: 'Critical safety step - do not skip'
      },
      {
        number: 2,
        title: 'Clean the Belt',
        description: 'Use a clean cloth to wipe down the belt surface and remove any debris. Vacuum around the deck area.',
        tip: 'A clean belt ensures better lubricant absorption'
      },
      {
        number: 3,
        title: 'Loosen the Belt',
        description: 'Slightly loosen the rear roller bolts (1/4 turn) to create space between belt and deck.',
        warning: 'Only loosen enough to lift belt edge - do not remove bolts completely'
      },
      {
        number: 4,
        title: 'Apply Lubricant',
        description: 'Lift one edge of the belt. Apply lubricant in a zigzag pattern along the deck surface. Use approximately 1-2 oz of silicone lubricant per application.',
        tip: 'Apply lubricant to the deck surface, not the belt bottom'
      },
      {
        number: 5,
        title: 'Distribute Lubricant',
        description: 'Re-tighten the belt tension bolts. Plug in and run the treadmill at 3 mph for 2-3 minutes to evenly distribute the lubricant.',
        tip: 'Walk on the belt while running to help distribute lubricant'
      },
      {
        number: 6,
        title: 'Check Belt Tension',
        description: 'Ensure belt is centered and has proper tension. You should be able to lift the belt 2-3 inches from the deck at the center.',
        warning: 'Incorrect tension causes premature wear'
      },
      {
        number: 7,
        title: 'Test and Wipe',
        description: 'Test the treadmill at various speeds. Wipe any excess lubricant from the belt surface with a clean cloth.',
        tip: 'Belt should run smoothly without slipping or jerking'
      }
    ],
    references: [
      'How to Apply Silicone Oil - Safety & Maintenance Advice',
      'https://treadmillrunningbelts.com.au'
    ],
    troubleshooting: [
      {
        issue: 'Belt slipping after lubrication',
        solution: 'Too much lubricant applied. Wipe excess and let machine run for 10 minutes to work it in.'
      },
      {
        issue: 'Belt still feels rough',
        solution: 'Insufficient lubrication or uneven distribution. Reapply and ensure proper distribution.'
      }
    ]
  },

  // ==================== ELLIPTICAL MAINTENANCE ====================
  'Elliptical Drive Belt Check': {
    equipment: EQUIPMENT_TYPES.ELLIPTICAL,
    difficulty: 'Medium',
    timeRequired: '15-25 minutes',
    frequency: 'Monthly inspection, replace every 2-3 years',
    tools: ['Allen wrench set', 'Lubricant spray', 'Clean cloth', 'Replacement belt (if needed)'],
    safety: [
      'Unplug machine before inspection',
      'Ensure all moving parts are stopped',
      'Check for pinch points before reassembly'
    ],
    steps: [
      {
        number: 1,
        title: 'Power Down',
        description: 'Unplug the elliptical and allow all moving parts to come to a complete stop.',
        warning: 'Wait 5 minutes after unplugging for safety'
      },
      {
        number: 2,
        title: 'Access Drive Belt',
        description: 'Remove the protective cover using an Allen wrench. Most ellipticals have 4-6 screws securing the cover.',
        tip: 'Keep screws organized in a small container'
      },
      {
        number: 3,
        title: 'Visual Inspection',
        description: 'Examine belt for cracks, fraying, glazing, or excessive wear. Check belt tension by pressing center - should deflect only 1/2 inch.',
        warning: 'Replace belt if any cracks or fraying visible'
      },
      {
        number: 4,
        title: 'Check Alignment',
        description: 'Ensure belt is properly aligned on pulleys. Misalignment causes premature wear and noise.',
        tip: 'Belt should run centered on both pulleys'
      },
      {
        number: 5,
        title: 'Lubricate Moving Parts',
        description: 'Apply lubricant to pivot points, rails, and bearings. Do NOT lubricate the belt itself.',
        warning: 'Use manufacturer-approved lubricant only'
      },
      {
        number: 6,
        title: 'Reassemble and Test',
        description: 'Replace protective cover and secure all screws. Plug in and test at low resistance for 2 minutes.',
        tip: 'Listen for unusual sounds during test'
      }
    ],
    references: [
      'CRC Industries - How to Lubricate Gym Equipment',
      'https://www.crcindustries.com/blog'
    ],
    troubleshooting: [
      {
        issue: 'Squeaking noise during operation',
        solution: 'Check pivot points and apply lubricant. Inspect belt for wear.'
      },
      {
        issue: 'Resistance feels inconsistent',
        solution: 'Check belt tension and alignment. May need replacement if glazed.'
      }
    ]
  },

  // ==================== ROWING MACHINE MAINTENANCE ====================
  'Rowing Machine Service': {
    equipment: EQUIPMENT_TYPES.ROWING_MACHINE,
    difficulty: 'Easy',
    timeRequired: '15-20 minutes',
    frequency: 'Monthly cleaning, annual deep service',
    tools: ['Soft cloth', 'Chain lubricant', 'Vacuum', 'Phillips screwdriver'],
    safety: [
      'Ensure machine is on stable surface',
      'Keep fingers clear of chain during inspection',
      'Use only approved lubricants'
    ],
    steps: [
      {
        number: 1,
        title: 'Dust and Clean',
        description: 'Wipe down entire machine with a soft, damp cloth. Pay special attention to the seat rail and handle.',
        tip: 'Clean after every heavy use session in commercial settings'
      },
      {
        number: 2,
        title: 'Inspect Chain/Strap',
        description: 'Check chain or strap for wear, kinks, or fraying. Ensure smooth movement without binding.',
        warning: 'Replace if any damage visible - critical safety component'
      },
      {
        number: 3,
        title: 'Lubricate Chain (if applicable)',
        description: 'For chain-drive models, apply chain lubricant sparingly. Wipe excess immediately.',
        tip: 'Use bicycle chain lubricant or manufacturer-specified product'
      },
      {
        number: 4,
        title: 'Check Air Damper (Concept2)',
        description: 'Remove damper cover and vacuum dust from flywheel and intake. This maintains resistance accuracy.',
        warning: 'Do this quarterly to prevent performance degradation'
      },
      {
        number: 5,
        title: 'Inspect Seat Rollers',
        description: 'Check seat rollers for smooth movement. Clean rail and check for wear on wheels.',
        tip: 'Replace rollers if flat spots develop'
      },
      {
        number: 6,
        title: 'Test All Functions',
        description: 'Test resistance settings, monitor functions, and ensure smooth operation throughout full stroke.',
        tip: 'Perform 20 test strokes at various resistance levels'
      }
    ],
    references: [
      'Concept2 Model D Maintenance Guide',
      'https://www.concept2.com/support/indoor-rowers/model-d/maintenance'
    ],
    troubleshooting: [
      {
        issue: 'Chain making clicking noise',
        solution: 'Clean and lubricate chain. Check for loose fasteners.'
      },
      {
        issue: 'Resistance feels weak',
        solution: 'Clean dust from flywheel damper area. Vacuum air intake.'
      }
    ]
  },

  // ==================== STAIRMASTER MAINTENANCE ====================
  'StairMaster Step Inspection': {
    equipment: EQUIPMENT_TYPES.STAIRMASTER,
    difficulty: 'Medium',
    timeRequired: '25-35 minutes',
    frequency: 'Every 500 operating hours',
    tools: ['Allen wrench set', 'Cleaning solution', 'Lubricant', 'Replacement parts kit'],
    safety: [
      'Lock out power before servicing',
      'Ensure steps are locked in position',
      'Wear safety glasses when working with moving parts'
    ],
    steps: [
      {
        number: 1,
        title: 'Power Off and Lock',
        description: 'Turn off and unplug machine. Engage safety lock if available to prevent step movement.',
        warning: 'Use lockout/tagout procedures in commercial facilities'
      },
      {
        number: 2,
        title: 'Inspect Step Treads',
        description: 'Check each step for wear, cracks, or damage. Ensure non-slip surface is intact.',
        warning: 'Replace any damaged steps immediately - fall hazard'
      },
      {
        number: 3,
        title: 'Check Step Chain/Belt',
        description: 'Inspect drive chain or belt for wear, proper tension, and alignment. Check sprockets for wear.',
        tip: 'Chain should have 1/2 inch deflection when pressed at center'
      },
      {
        number: 4,
        title: 'Lubricate Moving Parts',
        description: 'Apply lubricant to step pivots, chain, and guide rails. Wipe excess.',
        warning: 'Do not over-lubricate - attracts dust and debris'
      },
      {
        number: 5,
        title: 'Clean and Vacuum',
        description: 'Vacuum debris from base and around steps. Clean all step surfaces with appropriate cleaner.',
        tip: 'Commercial facilities should clean daily'
      },
      {
        number: 6,
        title: 'Reset Maintenance Counter',
        description: 'After service, reset the maintenance hour counter on the console. Consult manual for specific button sequence.',
        tip: 'Document service date and hours on maintenance log'
      },
      {
        number: 7,
        title: 'Test Operation',
        description: 'Power on and test all resistance levels. Steps should move smoothly without jerking or unusual sounds.',
        warning: 'Do not allow use if any issues detected'
      }
    ],
    references: [
      'StairMaster StepMill Owner\'s Manual',
      'https://coloradocardio.com/stairmaster-maintenance'
    ],
    troubleshooting: [
      {
        issue: 'Steps moving unevenly',
        solution: 'Check chain tension and alignment. Lubricate pivot points.'
      },
      {
        issue: 'Grinding or clicking sounds',
        solution: 'Inspect chain/belt for damage. Check all fasteners for tightness.'
      }
    ]
  },

  // ==================== STRENGTH EQUIPMENT ====================
  'Weight Machine Inspection': {
    equipment: EQUIPMENT_TYPES.GENERAL,
    difficulty: 'Easy',
    timeRequired: '30-45 minutes',
    frequency: 'Weekly for cables, monthly for comprehensive',
    tools: ['Allen wrench set', 'Cable lubricant', 'Torque wrench', 'Replacement hardware kit'],
    safety: [
      'Remove weight plates before servicing',
      'Inspect cables under no load',
      'Replace frayed cables immediately',
      'Always use proper lifting techniques'
    ],
    steps: [
      {
        number: 1,
        title: 'Remove Weight Load',
        description: 'Ensure all weight stacks are fully lowered and no tension on cables or pulleys.',
        warning: 'Never service under load - serious injury risk'
      },
      {
        number: 2,
        title: 'Cable Inspection',
        description: 'Inspect all cables for fraying, kinks, or corrosion. Run fingers along cable (with gloves) to feel for broken strands.',
        warning: 'Replace immediately if ANY fraying detected - do not delay'
      },
      {
        number: 3,
        title: 'Check Pulleys and Bearings',
        description: 'Spin each pulley to ensure smooth rotation. Listen for grinding sounds. Check for wobble or play.',
        tip: 'Pulleys should spin freely with minimal resistance'
      },
      {
        number: 4,
        title: 'Tighten Hardware',
        description: 'Check and tighten all bolts, nuts, and fasteners. Use torque wrench to manufacturer specifications.',
        warning: 'Do not over-tighten - can damage threads or crack components'
      },
      {
        number: 5,
        title: 'Lubricate Pivot Points',
        description: 'Apply appropriate lubricant to seat adjustments, pivot points, and guide rods. Wipe excess.',
        tip: 'Use Teflon-based lubricant for smooth operation'
      },
      {
        number: 6,
        title: 'Inspect Upholstery',
        description: 'Check all pads and upholstery for tears, wear, or damage. Clean with appropriate cleaner.',
        warning: 'Replace damaged upholstery - can cause skin injuries'
      },
      {
        number: 7,
        title: 'Weight Stack Check',
        description: 'Ensure weight plates move smoothly on guide rods. Check selector pin functionality.',
        tip: 'Guide rods should be straight with no bends'
      },
      {
        number: 8,
        title: 'Functional Test',
        description: 'Test machine through full range of motion with light weight. Check for smooth operation.',
        warning: 'Do not use if any binding or unusual sounds detected'
      }
    ],
    references: [
      'Life Fitness Strength Maintenance Schedule',
      'https://support.lifefitness.com/maintenance',
      'Cybex General Preventative Maintenance',
      'https://support.lifefitness.com/cybex-maintenance'
    ],
    troubleshooting: [
      {
        issue: 'Cable rubbing or not moving smoothly',
        solution: 'Check pulley alignment and lubricate. Inspect for worn pulleys.'
      },
      {
        issue: 'Weights sticking on guide rods',
        solution: 'Clean and lubricate guide rods. Check for bent rods or damaged bushings.'
      },
      {
        issue: 'Squeaking during use',
        solution: 'Lubricate all pivot points and check for loose hardware.'
      }
    ]
  },

  'Bench Press Inspection': {
    equipment: EQUIPMENT_TYPES.BENCH_PRESS,
    difficulty: 'Easy',
    timeRequired: '15-20 minutes',
    frequency: 'Weekly visual, monthly comprehensive',
    tools: ['Torque wrench', 'Allen wrench set', 'Cleaning solution', 'Lubricant'],
    safety: [
      'Check all bolts before each use in commercial settings',
      'Inspect upholstery for tears',
      'Ensure spotter bars function properly',
      'Never exceed weight capacity'
    ],
    steps: [
      {
        number: 1,
        title: 'Frame Inspection',
        description: 'Inspect welds and frame for cracks, bends, or damage. Check frame stability.',
        warning: 'Any cracks in welds require immediate decommission'
      },
      {
        number: 2,
        title: 'Bolt and Fastener Check',
        description: 'Tighten all bolts and fasteners to proper torque specifications. Check leg stabilizers.',
        tip: 'Use thread locker on bolts that consistently loosen'
      },
      {
        number: 3,
        title: 'Upholstery Inspection',
        description: 'Check bench pad for tears, wear, or compressed foam. Clean with disinfectant.',
        warning: 'Replace pads with significant wear or damage'
      },
      {
        number: 4,
        title: 'J-Hook/Spotter Inspection',
        description: 'Inspect J-hooks or spotter arms for wear, cracks, or deformation. Ensure secure attachment.',
        warning: 'Critical safety component - replace if any damage'
      },
      {
        number: 5,
        title: 'Adjustment Mechanism',
        description: 'Test height adjustment mechanisms. Lubricate adjustment posts and pins.',
        tip: 'Adjustments should lock firmly with no play'
      },
      {
        number: 6,
        title: 'Load Test',
        description: 'Perform load test with moderate weight to ensure stability and check for any unusual sounds.',
        warning: 'Test with spotter present for safety'
      }
    ],
    references: [
      'Commercial Gym Maintenance Checklist',
      'https://canadianfitnessrepair.com/commercial-gym-maintenance-checklist'
    ],
    troubleshooting: [
      {
        issue: 'Bench wobbles during use',
        solution: 'Check and tighten all leg bolts. Ensure surface is level.'
      },
      {
        issue: 'Adjustment pin won\'t stay in place',
        solution: 'Replace worn pin or inspect holes for damage/deformation.'
      }
    ]
  },

  'Squat Rack Maintenance': {
    equipment: EQUIPMENT_TYPES.SQUAT_RACK,
    difficulty: 'Easy',
    timeRequired: '20-25 minutes',
    frequency: 'Weekly inspection, monthly comprehensive',
    tools: ['Torque wrench', 'Level', 'Allen wrench set', 'Thread locker'],
    safety: [
      'Inspect safety pins/spotter arms before each use',
      'Check all welds regularly',
      'Ensure base is level and stable',
      'Never exceed weight capacity (typically 800-1000 lbs)'
    ],
    steps: [
      {
        number: 1,
        title: 'Structural Inspection',
        description: 'Examine all welds, joints, and frame components for cracks or stress marks.',
        warning: 'Any structural damage requires immediate removal from service'
      },
      {
        number: 2,
        title: 'J-Cup/Hook Inspection',
        description: 'Inspect J-cups or barbell holders for wear, cracks, or deformation. Check UHMW plastic liner.',
        warning: 'Replace if metal shows through plastic liner or if cracks present'
      },
      {
        number: 3,
        title: 'Safety Bar/Spotter Arms',
        description: 'Check safety spotter arms for secure attachment and proper function. Test locking mechanism.',
        warning: 'Critical safety component - must lock securely with no play'
      },
      {
        number: 4,
        title: 'Tighten All Fasteners',
        description: 'Check and tighten all bolts, especially base anchor bolts and upright connections. Use torque wrench.',
        tip: 'Apply thread locker to bolts that repeatedly loosen'
      },
      {
        number: 5,
        title: 'Level Check',
        description: 'Use level to ensure rack is perfectly vertical and base is level. Adjust feet if necessary.',
        warning: 'Unlevel rack can cause instability under heavy loads'
      },
      {
        number: 6,
        title: 'Clean and Sanitize',
        description: 'Clean all contact surfaces and J-cups. Sanitize according to facility protocols.',
        tip: 'Regular cleaning extends equipment life'
      },
      {
        number: 7,
        title: 'Load Test',
        description: 'Perform graduated load test up to 70% capacity to verify stability.',
        warning: 'Have spotter present during load testing'
      }
    ],
    references: [
      'Strength Equipment Maintenance Guidelines',
      'https://support.lifefitness.com/strength-maintenance'
    ],
    troubleshooting: [
      {
        issue: 'Rack wobbles under heavy load',
        solution: 'Check base bolts and ensure level. May need to anchor to floor.'
      },
      {
        issue: 'J-cups difficult to adjust',
        solution: 'Clean adjustment holes and pins. Lubricate lightly.'
      }
    ]
  },

  // ==================== BIKE MAINTENANCE ====================
  'Bike #1': {
    equipment: EQUIPMENT_TYPES.BIKE,
    difficulty: 'Easy',
    timeRequired: '20-30 minutes',
    frequency: 'Monthly inspection and cleaning',
    tools: ['Allen wrench set', 'Bike lubricant', 'Clean cloth', 'Cleaning solution'],
    safety: [
      'Disconnect power if electric bike',
      'Ensure bike is stable before servicing',
      'Check for sharp edges or pinch points'
    ],
    steps: [
      {
        number: 1,
        title: 'General Cleaning',
        description: 'Wipe down frame, handlebars, and seat with disinfectant cleaner. Remove dust and sweat buildup.',
        tip: 'Daily cleaning recommended in high-use facilities'
      },
      {
        number: 2,
        title: 'Seat and Handlebar Check',
        description: 'Test seat and handlebar adjustments. Tighten adjustment knobs and ensure smooth operation.',
        warning: 'Loose adjustments can cause injuries'
      },
      {
        number: 3,
        title: 'Pedal Inspection',
        description: 'Check pedals for cracks, worn straps, or loose attachment. Tighten pedal axle bolts.',
        warning: 'Replace damaged pedals immediately'
      },
      {
        number: 4,
        title: 'Drive System Check',
        description: 'Inspect belt or chain for wear and proper tension. Check flywheel for smooth rotation.',
        tip: 'Belt should have slight give when pressed'
      },
      {
        number: 5,
        title: 'Resistance Mechanism',
        description: 'Test resistance adjustment through full range. Lubricate resistance knob mechanism.',
        tip: 'Should adjust smoothly from minimum to maximum'
      },
      {
        number: 6,
        title: 'Electronics Check',
        description: 'Test console functions, heart rate monitor, and all display features.',
        tip: 'Replace batteries in wireless components if needed'
      }
    ],
    references: [
      'CRC Industries Equipment Lubrication Guide',
      'Precor Preventative Maintenance',
      'https://www.precor.com/preventative-maintenance'
    ],
    troubleshooting: [
      {
        issue: 'Squeaking from flywheel area',
        solution: 'Lubricate bearings and check belt tension.'
      },
      {
        issue: 'Resistance not changing',
        solution: 'Check resistance mechanism cable and adjust tension.'
      }
    ]
  },

  // ==================== BARBELL MAINTENANCE ====================
  'Barbell Maintenance': {
    equipment: EQUIPMENT_TYPES.BARBELLS,
    difficulty: 'Easy',
    timeRequired: '10-15 minutes per bar',
    frequency: 'Monthly for regular use, weekly for heavy commercial',
    tools: ['3-in-1 oil or barbell-specific oil', 'Nylon brush', 'Clean cloth', 'WD-40 (for rust removal)'],
    safety: [
      'Inspect for bends before each use',
      'Check knurling for excessive wear',
      'Ensure collars function properly'
    ],
    steps: [
      {
        number: 1,
        title: 'Visual Inspection',
        description: 'Roll bar on flat surface to check for bends. Inspect for cracks, especially near sleeves.',
        warning: 'Bent or cracked bars must be removed from service immediately'
      },
      {
        number: 2,
        title: 'Clean Knurling',
        description: 'Use nylon brush to clean chalk, sweat, and debris from knurling. Wipe with cloth.',
        tip: 'For stubborn buildup, use mild soap and water then dry thoroughly'
      },
      {
        number: 3,
        title: 'Inspect Sleeves',
        description: 'Spin sleeves to check for smooth rotation. Listen for grinding or roughness.',
        warning: 'Sleeves should spin freely - rough rotation means bearing damage'
      },
      {
        number: 4,
        title: 'Oil the Sleeves',
        description: 'Remove end caps if applicable. Add 3-5 drops of oil to each sleeve bearing. Spin to distribute.',
        tip: '3-in-1 oil or barbell-specific lubricant works best'
      },
      {
        number: 5,
        title: 'Check Collars',
        description: 'Test spring collars or quick-release mechanisms. Ensure they grip securely.',
        warning: 'Replace collars that don\'t hold plates firmly'
      },
      {
        number: 6,
        title: 'Rust Prevention',
        description: 'For raw steel bars, lightly oil the shaft to prevent rust. Wipe excess oil.',
        tip: 'Store bars horizontally on rack - never lean against wall'
      }
    ],
    references: [
      'Barbell Maintenance 101 - Titan Fitness',
      'https://titan.fitness/blogs/how-to/barbell-maintenance-101'
    ],
    troubleshooting: [
      {
        issue: 'Sleeves not spinning',
        solution: 'Remove end caps and clean bearings. Add fresh oil.'
      },
      {
        issue: 'Rust spots appearing',
        solution: 'Remove rust with WD-40 and brush. Apply protective oil coating.'
      }
    ]
  },

  // ==================== GENERAL MAINTENANCE TASKS ====================
  'Sanitize benches and wipe touchpoints': {
    equipment: EQUIPMENT_TYPES.GENERAL,
    difficulty: 'Easy',
    timeRequired: '5 minutes',
    frequency: 'After each use or daily',
    tools: ['Disinfectant cleaner', 'Microfiber cloths'],
    safety: ['Use gym-safe disinfectants', 'Wear gloves'],
    steps: [
      {
        number: 1,
        title: 'Clean and Disinfect',
        description: 'Spray disinfectant on cloth. Wipe all touchpoints (handles, seats, pads). Allow 30-second dwell time. Wipe dry.',
        warning: 'Never spray directly on equipment'
      }
    ],
    references: [],
    troubleshooting: []
  },

  'Inspect cable tension and pulleys': {
    equipment: EQUIPMENT_TYPES.CABLE_MACHINE,
    difficulty: 'Medium',
    timeRequired: '25-35 minutes',
    frequency: 'Weekly inspection',
    tools: ['Cable tension gauge', 'Lubricant', 'Allen wrench set', 'Replacement cables'],
    safety: [
      'Remove all weight plates first',
      'Inspect with no load on cables',
      'Wear safety glasses',
      'Replace frayed cables immediately - no exceptions'
    ],
    steps: [
      {
        number: 1,
        title: 'Unload Machine',
        description: 'Ensure all weight stacks are down and no tension on any cables.',
        warning: 'Critical safety step - never inspect under tension'
      },
      {
        number: 2,
        title: 'Visual Cable Inspection',
        description: 'Inspect every inch of cable for fraying, kinks, corrosion, or broken strands. Use bright light.',
        warning: 'Replace immediately if ANY damage found - cable failure causes injuries'
      },
      {
        number: 3,
        title: 'Tactile Cable Check',
        description: 'Run gloved hand along cable length to feel for broken strands that may not be visible.',
        tip: 'Broken strands feel like sharp points or burrs'
      },
      {
        number: 4,
        title: 'Pulley Inspection',
        description: 'Check each pulley for smooth rotation, worn bearings, or grooves. Spin pulleys by hand.',
        warning: 'Worn pulley grooves damage cables - replace promptly'
      },
      {
        number: 5,
        title: 'Lubricate Pulleys',
        description: 'Apply appropriate lubricant to pulley bearings. Ensure smooth, quiet operation.',
        tip: 'Pulleys should spin silently with minimal resistance'
      },
      {
        number: 6,
        title: 'Check Cable Stops',
        description: 'Inspect cable stops and ferrules for secure attachment. Ensure no sharp edges.',
        warning: 'Loose cable stops can cause sudden load release'
      },
      {
        number: 7,
        title: 'Tension Test',
        description: 'Test cable under light load to ensure smooth operation. Check for binding or irregular movement.',
        tip: 'Cable should move smoothly without jerking'
      }
    ],
    references: [
      'Cybex Cable Inspection Guidelines',
      'https://support.lifefitness.com/cybex-maintenance'
    ],
    troubleshooting: [
      {
        issue: 'Cable making grinding sound',
        solution: 'Check pulley bearings and cable routing. May need pulley replacement.'
      },
      {
        issue: 'Cable bunching or kinking',
        solution: 'Check routing and pulley alignment. Replace cable if kinked.'
      }
    ]
  },

  'Lubricate treadmill belts': {
    equipment: EQUIPMENT_TYPES.TREADMILL,
    difficulty: 'Medium',
    timeRequired: '20 minutes',
    frequency: 'Every 3 months or 150 hours',
    tools: ['100% silicone lubricant', 'Clean cloth'],
    safety: ['Unplug before servicing', 'Never use petroleum-based lubricants'],
    steps: [
      {
        number: 1,
        title: 'Lubricate Belt',
        description: 'Follow the comprehensive "Treadmill Belt Lubrication" procedure for detailed step-by-step instructions.',
        tip: 'Refer to main treadmill maintenance guide above'
      }
    ],
    references: [],
    troubleshooting: []
  },

  'Tighten hardware on weight machines': {
    equipment: EQUIPMENT_TYPES.GENERAL,
    difficulty: 'Easy',
    timeRequired: '15 minutes',
    frequency: 'Weekly',
    tools: ['Torque wrench', 'Allen wrench set', 'Thread locker'],
    safety: ['Use proper torque specs', 'Never over-tighten'],
    steps: [
      {
        number: 1,
        title: 'Check and Tighten',
        description: 'Systematically check all bolts and fasteners. Torque to manufacturer spec (typically 25-30 ft-lbs). Apply thread locker to repeatedly loose bolts.',
        warning: 'Over-tightening can damage equipment'
      }
    ],
    references: [],
    troubleshooting: []
  },

  'Clean and realign sensor mounts': {
    equipment: EQUIPMENT_TYPES.GENERAL,
    difficulty: 'Medium',
    timeRequired: '20 minutes',
    frequency: 'Monthly',
    tools: ['Compressed air', 'Isopropyl alcohol', 'Cotton swabs'],
    safety: ['Disconnect power before cleaning', 'Handle sensors gently'],
    steps: [
      {
        number: 1,
        title: 'Clean and Align',
        description: 'Power off. Use compressed air and alcohol swab to clean sensor. Check alignment with target. Tighten mounting screws. Test functionality.',
        warning: 'Misaligned sensors cause inaccurate readings'
      }
    ],
    references: ['OnSight Sensor Guide'],
    troubleshooting: []
  },

  'Vacuum debris around moving parts': {
    equipment: EQUIPMENT_TYPES.GENERAL,
    difficulty: 'Easy',
    timeRequired: '10 minutes',
    frequency: 'Weekly',
    tools: ['Shop vacuum', 'Compressed air'],
    safety: ['Power off all equipment', 'Wear safety glasses with compressed air'],
    steps: [
      {
        number: 1,
        title: 'Vacuum and Inspect',
        description: 'Power off equipment. Vacuum around motors, flywheels, and vents. Use compressed air for tight spaces. Inspect for damage while cleaning.',
        warning: 'Check for loose parts or unusual wear'
      }
    ],
    references: [],
    troubleshooting: []
  },

  // ==================== FACILITY MAINTENANCE (SIMPLIFIED) ====================
  'HVAC System Service': {
    equipment: 'HVAC',
    difficulty: 'Advanced',
    timeRequired: '1-2 hours',
    frequency: 'Quarterly',
    tools: ['Replacement filters', 'Vacuum', 'Cleaning supplies'],
    safety: ['Turn off system at breaker', 'Wear dust mask', 'Call certified technician for repairs'],
    steps: [
      {
        number: 1,
        title: 'Replace Air Filters',
        description: 'Turn off system. Remove and replace air filters. Document filter size and date.',
        warning: 'System must be off during filter replacement'
      },
      {
        number: 2,
        title: 'Clean Coils and Drains',
        description: 'Vacuum coils and ensure drain line is clear. Clean accessible components.',
        tip: 'Schedule professional service quarterly'
      },
      {
        number: 3,
        title: 'Professional Inspection',
        description: 'Contact certified HVAC technician for complete system check and refrigerant service.',
        warning: 'Refrigerant work requires EPA certification'
      }
    ],
    references: ['HVAC Manufacturer Guide'],
    troubleshooting: []
  },

  'Air Filter Replacement': {
    equipment: 'HVAC',
    difficulty: 'Easy',
    timeRequired: '10 minutes',
    frequency: 'Monthly',
    tools: ['Replacement filters', 'Marker'],
    safety: ['Turn off HVAC system', 'Wear dust mask'],
    steps: [
      {
        number: 1,
        title: 'Replace Filter',
        description: 'Turn off system. Remove old filter, noting arrow direction. Install new filter with arrow pointing in airflow direction. Mark installation date.',
        warning: 'Arrow must point in correct direction'
      }
    ],
    references: [],
    troubleshooting: []
  },

  'Locker Room Plumbing Check': {
    equipment: 'Plumbing',
    difficulty: 'Easy',
    timeRequired: '30 minutes',
    frequency: 'Weekly',
    tools: ['Plunger', 'Wrench', 'Cleaning supplies'],
    safety: ['Wear gloves', 'Call licensed plumber for major issues'],
    steps: [
      {
        number: 1,
        title: 'Inspect and Test',
        description: 'Check all fixtures for leaks. Test drains and water pressure. Clear minor clogs with plunger.',
        warning: 'Report persistent leaks immediately'
      }
    ],
    references: [],
    troubleshooting: []
  },

  'Emergency Exit Lighting Test': {
    equipment: 'Safety Systems',
    difficulty: 'Easy',
    timeRequired: '30 minutes',
    frequency: 'Monthly',
    tools: ['Testing log'],
    safety: ['Test during low-occupancy hours', 'Follow fire code requirements'],
    steps: [
      {
        number: 1,
        title: 'Function Test',
        description: 'Press test button on each exit sign. Verify illumination for 30+ seconds. Document all results.',
        warning: 'Required by fire code - must document'
      },
      {
        number: 2,
        title: 'Annual Full Test',
        description: 'Disconnect power annually and verify 90-minute runtime. Replace batteries as needed.',
        tip: 'Schedule during slow hours'
      }
    ],
    references: ['NFPA 101 Life Safety Code'],
    troubleshooting: []
  },

  'Sauna Heater Inspection': {
    equipment: 'Sauna',
    difficulty: 'Medium',
    timeRequired: '20 minutes',
    frequency: 'Monthly',
    tools: ['Thermometer', 'Cleaning supplies'],
    safety: ['Turn off power', 'Allow to cool completely', 'Call electrician for repairs'],
    steps: [
      {
        number: 1,
        title: 'Inspect and Clean',
        description: 'Turn off and cool down. Check heating elements and rocks. Verify temperature accuracy. Clean surfaces.',
        warning: 'Never service while hot'
      }
    ],
    references: [],
    troubleshooting: []
  },

  'Fire Extinguisher Replacement': {
    equipment: 'Safety Equipment',
    difficulty: 'Easy',
    timeRequired: '15 minutes',
    frequency: 'Monthly inspection, annual service',
    tools: ['Inspection tags', 'Replacement units'],
    safety: ['Follow fire code requirements'],
    steps: [
      {
        number: 1,
        title: 'Monthly Check',
        description: 'Verify pressure gauge in green zone, seals intact, no damage. Document inspection date.',
        warning: 'Replace if pressure low or seal broken'
      },
      {
        number: 2,
        title: 'Annual Service',
        description: 'Schedule professional service and recertification per fire code requirements.',
        tip: 'Keep documentation for inspections'
      }
    ],
    references: ['Fire Code Requirements'],
    troubleshooting: []
  },

  'Swimming Pool Chlorine Check': {
    equipment: 'Pool Systems',
    difficulty: 'Medium',
    timeRequired: '20 minutes',
    frequency: 'Daily',
    tools: ['Test strips', 'Chlorine', 'pH adjuster'],
    safety: ['Wear gloves when handling chemicals', 'Ensure proper ventilation'],
    steps: [
      {
        number: 1,
        title: 'Test and Adjust',
        description: 'Test chlorine (1-3 ppm) and pH (7.2-7.6) levels. Add chemicals as needed. Document readings.',
        warning: 'Never mix chemicals directly'
      }
    ],
    references: ['Pool Maintenance Standards'],
    troubleshooting: []
  },

  // ==================== DEFAULT/FALLBACK ====================
  'Daily safety inspection': {
    equipment: EQUIPMENT_TYPES.GENERAL,
    difficulty: 'Easy',
    timeRequired: '15 minutes',
    frequency: 'Daily',
    tools: ['Checklist'],
    safety: ['Report all issues immediately', 'Tag out damaged equipment'],
    steps: [
      {
        number: 1,
        title: 'Facility Walk-Through',
        description: 'Walk through facility checking equipment for damage. Test critical functions. Verify cleanliness. Document all issues.',
        warning: 'Tag any non-functional equipment immediately'
      }
    ],
    references: [],
    troubleshooting: []
  }
};

// Helper function to get instructions by task title
export function getMaintenanceInstructions(taskTitle) {
  // Try exact match first
  if (MAINTENANCE_INSTRUCTIONS[taskTitle]) {
    return MAINTENANCE_INSTRUCTIONS[taskTitle];
  }
  
  // Try partial match
  const lowerTitle = taskTitle?.toLowerCase() || '';
  for (const [key, value] of Object.entries(MAINTENANCE_INSTRUCTIONS)) {
    if (lowerTitle.includes(key.toLowerCase()) || key.toLowerCase().includes(lowerTitle)) {
      return value;
    }
  }
  
  // Return default if no match
  return {
    equipment: EQUIPMENT_TYPES.GENERAL,
    difficulty: 'Medium',
    timeRequired: '15-30 minutes',
    frequency: 'As needed',
    tools: ['Basic tool kit'],
    safety: ['Follow standard safety procedures'],
    steps: [
      {
        number: 1,
        title: 'Assess Situation',
        description: 'Evaluate the maintenance task requirements and gather necessary tools.',
        tip: 'Consult equipment manual for specific guidance'
      },
      {
        number: 2,
        title: 'Perform Maintenance',
        description: 'Complete the maintenance task following manufacturer guidelines.',
        warning: 'Document all work performed'
      },
      {
        number: 3,
        title: 'Test and Verify',
        description: 'Test equipment functionality and safety before returning to service.',
        warning: 'Do not release for use if any issues remain'
      }
    ],
    references: ['Equipment manufacturer documentation'],
    troubleshooting: []
  };
}

// Get difficulty badge color
export function getDifficultyColor(difficulty) {
  switch(difficulty?.toLowerCase()) {
    case 'easy': return '#22c55e';
    case 'medium': return '#f59e0b';
    case 'hard':
    case 'advanced': return '#ef4444';
    default: return '#94a3b8';
  }
}

