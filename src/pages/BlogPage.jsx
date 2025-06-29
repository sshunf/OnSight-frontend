import React from 'react';

function BlogPage() {
  return (
    <section id="blogSection" className="relative py-24 px-6 lg:px-8 bg-black/95">
      <div className="mx-auto max-w-6xl">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold tracking-tight sm:text-5xl text-white">
            OnSight Blog
          </h2>
          <p className="mt-4 text-lg text-gray-400">
            Stay updated with the latest insights, trends, and innovations in gym technology and fitness facility management.
          </p>
        </div>
        
        <div className="flex justify-center">
          <article className="bg-gray-900/50 border border-gray-800 rounded-xl overflow-hidden max-w-5xl w-full">
            <div className="p-8 md:p-12">
              <div className="grid md:grid-cols-3 gap-x-12">
                <div className="md:col-span-1 mb-8 md:mb-0">
                  <p className="text-5xl mb-4">🎯</p>
                  <p className="text-sm text-gray-400 mb-2">June 15, 2025</p>
                  <h3 className="text-2xl font-bold text-white">Welcome to OnSight</h3>
                </div>
                <div className="md:col-span-2 text-gray-300 text-lg space-y-6">
                  <p>Welcome to the OnSight blog! We're excited to share our journey as we revolutionize gym and fitness facility management through cutting-edge technology and data-driven insights.</p>
                  <p>OnSight is more than just a monitoring system – it's a comprehensive solution designed to help gym owners optimize their operations, enhance member experiences, and maximize their facility's potential.</p>
                  <p>Stay tuned for updates on our pilot program, insights from the fitness industry, and the latest developments in gym technology. We're building something special, and we can't wait to share it with you.</p>
                </div>
              </div>
              <div className="text-center pt-8 mt-8 border-t border-gray-700">
                <span className="text-purple-400 font-medium text-lg">Welcome to the future of fitness facility management.</span>
              </div>
            </div>
          </article>
        </div>
      </div>
    </section>
  );
}

export default BlogPage; 