/**
 * DO-MAIN-IT — Default Pre-Loaded Quiz Library
 */

const DEFAULT_QUIZZES = [
  {
    id: 'quiz-cyberpunk-tech',
    title: 'Cyberpunk & Tech Frontiers',
    description: 'Neural interfaces, quantum processors, cryptographic warfare, and future tech.',
    category: 'Technology',
    coverIcon: 'Cpu',
    questions: [
      {
        id: 'c1',
        text: 'What is the fundamental unit of quantum information in quantum computing?',
        type: 'multiple_choice',
        timeLimit: 20,
        options: ['Qubit', 'Byte', 'Synapse', 'Photon Gate'],
        correctIndex: 0,
        explanation: 'A qubit (quantum bit) is the basic unit of quantum information, capable of superposition.'
      },
      {
        id: 'c2',
        text: 'In neural network architectures, what does the "Transformer" attention mechanism primarily replace?',
        type: 'multiple_choice',
        timeLimit: 20,
        options: ['Recurrent step-by-step loops (RNNs)', 'Linear layers', 'Activation functions', 'Floating-point math'],
        correctIndex: 0,
        explanation: 'Transformers process all sequence tokens in parallel via self-attention rather than sequential recurrence.'
      },
      {
        id: 'c3',
        text: 'Zero-Knowledge Proofs allow one party to prove a statement is true without revealing any secret information.',
        type: 'true_false',
        timeLimit: 15,
        options: ['True', 'False'],
        correctIndex: 0,
        explanation: 'ZKPs enable cryptographic verification without revealing the underlying data.'
      },
      {
        id: 'c4',
        text: 'Which protocol forms the core encrypted handshake of modern secure web communications?',
        type: 'multiple_choice',
        timeLimit: 20,
        options: ['TLS (Transport Layer Security)', 'FTP over SSH', 'DNSSEC raw relay', 'BGP routing guard'],
        correctIndex: 0,
        explanation: 'TLS 1.3 encrypts application traffic between clients and web servers.'
      },
      {
        id: 'c5',
        text: 'What term describes a cybernetic implant directly linking human brain tissue to machine circuitry?',
        type: 'multiple_choice',
        timeLimit: 20,
        options: ['Brain-Computer Interface (BCI)', 'Optic Hub Gateway', 'Somatic Router', 'Dermal Mesh Node'],
        correctIndex: 0,
        explanation: 'BCIs record neural signals and translate them into commands for external machines.'
      },
      {
        id: 'c6',
        text: 'In cryptography, SHA-256 is an example of a reversible symmetric encryption algorithm.',
        type: 'true_false',
        timeLimit: 15,
        options: ['False', 'True'],
        correctIndex: 0,
        explanation: 'SHA-256 is a one-way cryptographic hash function, not a reversible encryption algorithm.'
      },
      {
        id: 'c7',
        text: 'Which of the following are characteristics of decentralized distributed ledgers? (Select correct)',
        type: 'multiple_choice',
        timeLimit: 25,
        options: ['Consensus mechanisms', 'Single central mainframe authority', 'Cryptographic block chaining', 'Immutable historical state'],
        correctIndex: 0, // In MVP scoring, single best match / multi choice
        explanation: 'Decentralized ledgers rely on distributed consensus without a single point of failure.'
      }
    ]
  },
  {
    id: 'quiz-ancient-warfare',
    title: 'Ancient Empires & Tactical Warfare',
    description: 'Test your strategic knowledge of ancient military campaigns, siege weapons, and empires.',
    category: 'History',
    coverIcon: 'Shield',
    questions: [
      {
        id: 'h1',
        text: 'Which ancient general marched war elephants across the Alps to invade the Roman Republic?',
        type: 'multiple_choice',
        timeLimit: 20,
        options: ['Hannibal Barca', 'Alexander the Great', 'Julius Caesar', 'Sun Tzu'],
        correctIndex: 0,
        explanation: 'Carthaginian general Hannibal Barca famously led his army and 37 elephants over the Alps in 218 BC.'
      },
      {
        id: 'h2',
        text: 'The Roman military formation featuring soldiers locking shields on all sides and overhead was called what?',
        type: 'multiple_choice',
        timeLimit: 20,
        options: ['Testudo (Tortoise)', 'Phalanx', 'Wedge', 'Cantabrian Circle'],
        correctIndex: 0,
        explanation: 'The Testudo shield formation protected legions against heavy arrow volleys and thrown spears.'
      },
      {
        id: 'h3',
        text: 'Sun Tzu authored "The Art of War" during the Warring States period of ancient China.',
        type: 'true_false',
        timeLimit: 15,
        options: ['True', 'False'],
        correctIndex: 0,
        explanation: 'Sun Tzu was an ancient Chinese military general, strategist, and philosopher.'
      },
      {
        id: 'h4',
        text: 'Which legendary empire built the fortified island city of Tyre that Alexander the Great besieged with a massive causeway?',
        type: 'multiple_choice',
        timeLimit: 20,
        options: ['Phoenician Empire', 'Babylonian Empire', 'Persian Achaemenids', 'Minoan Civilization'],
        correctIndex: 0,
        explanation: 'Tyre was a formidable Phoenician coastal fortress island besieged in 332 BC.'
      },
      {
        id: 'h5',
        text: 'The Spartan bronze-armored infantry soldier was historically known by what title?',
        type: 'multiple_choice',
        timeLimit: 20,
        options: ['Hoplite', 'Legionary', 'Immortal', 'Centurion'],
        correctIndex: 0,
        explanation: 'Hoplites were citizen-soldiers of ancient Greek city-states equipped with spears and round shields.'
      }
    ]
  },
  {
    id: 'quiz-cosmos-science',
    title: 'Science, Cosmos & Quantum Realms',
    description: 'Explore the boundaries of astrophysics, relativity, biology, and particle physics.',
    category: 'Science',
    coverIcon: 'Zap',
    questions: [
      {
        id: 's1',
        text: 'What boundary around a black hole marks the point beyond which not even light can escape?',
        type: 'multiple_choice',
        timeLimit: 20,
        options: ['Event Horizon', 'Ergosphere', 'Roche Limit', 'Photon Sphere'],
        correctIndex: 0,
        explanation: 'The Event Horizon is the gravitational boundary where escape velocity exceeds light speed.'
      },
      {
        id: 's2',
        text: 'Light travels faster in a vacuum than through liquid water or glass.',
        type: 'true_false',
        timeLimit: 15,
        options: ['True', 'False'],
        correctIndex: 0,
        explanation: 'In vacuum, light travels at approximately 299,792 km/s, slowing down when entering optical media.'
      },
      {
        id: 's3',
        text: 'Which subatomic particle was discovered at CERN in 2012, confirming the mechanism giving mass to particles?',
        type: 'multiple_choice',
        timeLimit: 20,
        options: ['Higgs Boson', 'Muon Neutrino', 'Top Quark', 'Graviton'],
        correctIndex: 0,
        explanation: 'The Higgs Boson associated with the Higgs field provides mass to gauge bosons.'
      },
      {
        id: 's4',
        text: 'What is the most abundant chemical element in the observable universe by mass?',
        type: 'multiple_choice',
        timeLimit: 20,
        options: ['Hydrogen', 'Helium', 'Carbon', 'Oxygen'],
        correctIndex: 0,
        explanation: 'Hydrogen constitutes approximately 74% of all baryonic matter in the cosmos.'
      }
    ]
  }
];

module.exports = {
  DEFAULT_QUIZZES
};
