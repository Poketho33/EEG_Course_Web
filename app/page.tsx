import 'server-only'

import { trpc, HydrateClient } from '../trpc/server';

export default async function Home() {
  await trpc.hello.getMessage.prefetch({ text: 'World' });

  return (
    <HydrateClient>
      <div className="">
        <div className="px-8 py-12 gap-2">
          <h1 className='text-2xl max-w-[500px] font-bold'>
            Interactive web-apps for visualising, teaching and investigating advanced scalp and intracranial EEG analysis.
          </h1>

          <p className="">
            Welcome to the prototype of a future interactive learning platform dedicated to advanced EEG analysis. Here, you will find a series of web applications designed to help you intuitively explore key concepts such as electrical source imaging (ESI) and functional connectivity. Developed for students and researchers, this open-access resource aims to make complex neuroimaging methods more accessible. The applications are built using NiiVue and Plotly and were developed by Dr Nicolas Roehri and Mr Steven Beumer MSc at the University of Geneva, Faculty of Medecine, University Hospital of Geneva, Epilepsy Unit. This work was co-financed by the SNSF (209120 awarded to Dr Roehri, 209470 awarded to Prof. Vulliemoz) and la commission d'informatique of the UNIGE.
          </p>
          <p className="">
            This platform is organised into three main sections: Courses, Demos, and Quizzes. The Courses section offers a solid mathematical foundation in electrical source imaging and functional connectivity, complemented by interactive, hands-on toy examples. In the Demos section, you can explore real-world case studies in depth, helping to build intuition around these complex concepts. Finally, the Quizzes section provides procedurally generated exercises to test and reinforce your understanding.
          </p>
        </div>
      </div>
    </HydrateClient>
  );
}
