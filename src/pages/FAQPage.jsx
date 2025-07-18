import React from 'react';

function FAQPage() {
  const faqs = [
    {
      question: "What is OnSight and how does it work?",
      answer: "OnSight is a platform that allows you to monitor the occupancy of your gym in real-time. We combine hardware and software to accurately track gym analytics to help you make data-driven decisions."
    },
    {
      question: "What equipment is required for installation?",
      answer: "All sensors can be installed in minutes with no tools required. The sensors are designed to be installed in a variety of locations and come included with a battery that lasts up to 1 year."
    },
    {
      question: "How much does OnSight cost?",
      answer: "OnSight is currently in its beta phase and is free to use. We will be launching a subscription model in the future."
    },
    {
      question: "Is my gym's data secure?",
      answer: "Yes, we take data security seriously. All data is encrypted and stored in a secure database, where it is only accessible by the user."
    },
    {
      question: "Do you offer customer support?",
      answer: "Yes, we offer customer support via email and phone. We are also available to answer any questions you may have about the product and installation."
    },
    {
      question: "Can I integrate OnSight with my existing gym management software?",
      answer: "Yes, we offer a variety of integrations with popular gym management software. We are also working on our own gym management software to help you manage your gym more efficiently."
    }
  ];

  return (
    <section id="faqSection" className="pt-24 px-6 py-12 relative z-10">
      <div className="mx-auto max-w-4xl">
        <h2 className="text-5xl font-bold mb-8 text-center">Frequently Asked Questions</h2>
        <div className="space-y-8">
          {faqs.map((faq, index) => (
            <div key={index} className="bg-gray-900/50 border border-gray-800 rounded-lg p-6">
              <h3 className="text-xl font-bold text-white mb-3">{faq.question}</h3>
              <p className="text-gray-300">{faq.answer}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default FAQPage; 