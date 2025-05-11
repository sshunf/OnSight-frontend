import React from 'react';
import '../css/TeamSection.css';

function TeamSection() {
  const teamMembers = [
    {
      name: 'Angel Mendoza',
      role: 'Co-Founder & CEO',
      description: '3rd Year Mechanical Engineering & Business at Northwestern University.',
      image: 'angel.jpg',
    },
    {
      name: 'Matt Martinez',
      role: 'Co-Founder & COO',
      description: '3rd Year Mechanical Engineering & Psychology at Northwestern University.',
      image: 'matt.jpg',
    },
  ];

  return (
    <section id="teamSection" className="pt-16 px-6 py-24 bg-black">
      <div className="mx-auto max-w-7xl">
        <h2 className="text-3xl font-bold text-white mb-8 text-center">Our Team</h2>
        <div className="flex flex-wrap justify-center gap-6">
          {teamMembers.map((member, index) => (
            <div key={index} className="bg-gray-800 p-4 rounded text-center">
              <img
                src={member.image}
                alt={member.name}
                className="w-48 h-auto rounded mb-2 mx-auto"
              />
              <h3 className="text-lg font-semibold text-white">{member.name}</h3>
              <p className="text-gray-400">{member.role}</p>
              <p className="text-gray-400">{member.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default TeamSection;