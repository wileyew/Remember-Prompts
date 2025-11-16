
import React, { useState } from 'react';

const tutorials = [
  {
    title: 'Understanding and Identifying AI Hallucinations',
    lessons: [
      {
        title: 'Introduction to AI Hallucinations',
        content: `
          <h2>Definition</h2>
          <p>AI hallucinations occur when an AI model generates outputs (text, images, etc.) that are factually incorrect, nonsensical, or deviate from reality. This is not due to intentional errors, but rather limitations in the AI's training data, understanding of context, or the inherent complexity of the task.</p>
          
          <h2>Examples</h2>
          <ul>
            <li>A chatbot confidently asserting historical events that never happened.</li>
            <li>A language model generating a story with characters performing physically impossible actions.</li>
            <li>An image generation tool creating pictures with objects distorted or misrepresented.</li>
          </ul>
          
          <h2>Why It Happens</h2>
          <p>Hallucinations can arise due to various factors:</p>
          <ul>
            <li>Insufficient or biased training data.</li>
            <li>The AI's attempt to fill in gaps in knowledge with plausible-sounding but incorrect information.</li>
            <li>Complexity of the task, especially in areas with limited training data or ambiguous scenarios.</li>
          </ul>
          <h2>Resources</h2>
          <br></br>
          <ul>
            <li><a href="https://arxiv.org/abs/2107.12408">AI Hallucinations Explained</a></li>
            <li><a href="https://www.cio.com/article/3623656/ai-hallucinations-a-growing-challenge-for-businesses.html">Understanding AI Hallucinations</a></li>
          </ul>
          <br></br>
          <h2>Exercise</h2>
          <br></br>
          <p>Start a forum discussion asking learners to share any experiences they’ve had with AI hallucinations.</p>
        `
      },
      {
        title: 'Identifying Hallucinations',
        content: `
          <h2>Techniques</h2>
          <br></br>
          <ul>
            <li><strong>Fact-checking</strong>: Compare AI-generated content with reliable sources.</li>
            <li><strong>Cross-referencing</strong>: Use multiple AI models to verify the consistency of generated content.</li>
          </ul>
          <br></br>
          <h2>Exercise</h2>
          <br></br>
          <p>Use a generative AI tool (e.g., GPT-3) to generate responses to various prompts. Have learners identify hallucinations by fact-checking against trusted sources.</p>
          <br></br>
          <h2>Resources</h2>
          <br></br>
          <ul>
            <li><a href="https://www.ibm.com/blogs/research/2021/07/mitigating-ai-hallucinations/">Techniques to Mitigate AI Hallucinations</a></li>
          </ul>
        `
      },
      {
        title: 'Addressing Hallucinations',
        content: `
          <h2>Approaches</h2>
          <br></br>
          <ul>
            <li><strong>Training Data Improvements</strong>: Enhance training data quality and diversity.</li>
            <li><strong>Post-processing Techniques</strong>: Implement algorithms to detect and correct hallucinations.</li>
          </ul>
          <br></br>
          <h2>Exercise</h2>
          <br></br>
          <p>Modify a dataset and retrain a simple AI model to reduce hallucinations.</p>
          <br></br>
          <h2>Resources</h2>
          <br></br>
          <ul>
            <li><a href="https://towardsdatascience.com/ai-model-training-best-practices-4a92f3e492f8">AI Model Training Best Practices</a></li>
          </ul>
        `
      }
    ]
  },
  {
    title: 'Identifying and Reporting Copyright Issues in AI',
    lessons: [
      {
        title: 'Introduction to Copyright and AI',
        content: `
        <h2>Definition</h2>
        <p>Copyright law protects original works of authorship, including text, images, music, and code. AI systems, especially generative models, can create content that may infringe upon existing copyrights if they reproduce or substantially copy protected works without permission.</p>
        
        <h2>Examples</h2>
        <ul>
          <li>An AI image generator producing art that closely resembles a copyrighted painting.</li>
          <li>An AI-powered writing tool generating text plagiarized from a copyrighted book.</li>
          <li>An AI music composer creating melodies that are strikingly similar to copyrighted songs.</li>
        </ul>
          <br></br>
          <p>Provide instances where AI-generated content has led to copyright disputes.</p>
          <br></br>
          <h2>Resources</h2>
          <br></br>
          <ul>
            <li><a href="https://www.wipo.int/about-ip/en/artificial_intelligence.html">Copyright in the Age of AI</a></li>
          </ul>
          <br></br>
          <h2>Exercise</h2>
          <br></br>
          <p>Review case studies of copyright infringement involving AI and discuss the outcomes.</p>
        `
      },
      {
        title: 'Identifying Copyright Infringements',
        content: `
          <h2>Techniques</h2>
          <br></br>
          <ul>
            <li><strong>Content Comparison</strong>: Compare AI-generated content with existing works to identify potential infringements.</li>
            <li><strong>Tools and Services</strong>: Introduce tools that help in detecting copyright infringement (e.g., Google Reverse Image Search, Copyscape).</li>
          </ul> 
          <br></br>
          <h2>Exercise</h2>
          <br></br>
          <p>Use an AI model to generate images or text and use tools to check for potential copyright infringements.</p>
          <br></br>
          <h2>Resources</h2>
          <br></br>
          <ul>
            <li><a href="https://www.copyscape.com/">Copyright Detection Tools</a></li>
          </ul>
        `
      },
      {
        title: 'Reporting Copyright Infringements',
        content: `
          <h2>Procedures</h2>
          <br></br>
          <ul>
            <li><strong>Documentation</strong>: Gather evidence and document the infringement.</li>
            <li><strong>Legal Steps</strong>: Follow the legal procedures for reporting and addressing copyright issues.</li>
          </ul>
          <br></br>
          <h2>Exercise</h2>
          <br></br>
          <p>Simulate reporting a copyright infringement using a provided scenario.</p>
          <br></br>
          <h2>Resources</h2>
          <br></br>
          <ul>
            <li><a href="https://www.copyright.gov/help/faq/faq-general.html">How to Report Copyright Infringement</a></li>
          </ul>
        `
      }
    ]
  },
  {
    title: 'Identifying and Reporting Security Incidents in AI Systems',
    lessons: [
      {
        title: 'Introduction to Security in AI',
        content: `
        <h2>Definition</h2>
          <p>AI security involves protecting AI systems from vulnerabilities and threats that could compromise their integrity, confidentiality, or availability. This includes safeguarding training data, models, and the infrastructure used to run AI applications.</p>
          
          <h2>Examples of Security Incidents</h2>
          <ul>
            <li>Data poisoning: Malicious actors intentionally introducing corrupted data into the training set to manipulate the AI's behavior.</li>
            <li>Adversarial attacks: Crafting inputs designed to deceive AI models and cause them to make incorrect predictions or classifications.</li>
            <li>Model theft: Unauthorized access and theft of proprietary AI models.</li>
          </ul>
          <br></br>
          <p>Discuss various security incidents involving AI, such as data breaches and adversarial attacks.</p>
          <br></br>
          <h2>Resources</h2>
          <br></br>
          <ul>
            <li><a href="https://www.csoonline.com/article/3531051/the-top-security-and-privacy-issues-facing-ai.html">AI Security Challenges</a></li>
          </ul>
          <br></br>
          <h2>Exercise</h2>
          <br></br>
          <p>Facilitate a discussion on recent AI security breaches and their implications.</p>
        `
      },
      {
        title: 'Identifying Security Incidents',
        content: `
          <h2>Techniques</h2>
          <br></br>
          <ul>
            <li><strong>Anomaly Detection</strong>: Use anomaly detection methods to identify unusual behavior in AI systems.</li>
            <li><strong>Security Audits</strong>: Conduct regular security audits and vulnerability assessments.</li>
          </ul>
          <br></br>
          <h2>Exercise</h2>
          <br></br>
          <p>Perform a basic security audit on an AI application.</p>
          <br></br>
          <h2>Resources</h2>
          <br></br>
          <ul>
            <li><a href="https://towardsdatascience.com/anomaly-detection-techniques-in-machine-learning-4d3c1c1a177">Introduction to Anomaly Detection</a></li>
          </ul>
        `
      },
      {
        title: 'Reporting Security Incidents',
        content: `
          <h2>Procedures</h2>
          <br></br>
          <ul>
            <li><strong>Incident Response Plan</strong>: Develop and follow an incident response plan.</li>
            <li><strong>Reporting Channels</strong>: Use appropriate channels to report security incidents (e.g., CERTs, company-specific reporting mechanisms).</li>
          </ul>
          <br></br>
          <h2>Exercise</h2>
          <br></br>
          <p>Create a mock incident report based on a provided scenario.</p>
          <br></br>
          <h2>Resources</h2>
          <br></br>
          <ul>
            <li><a href="https://www.sans.org/security-resources/posters/incident-response/">Security Incident Response</a></li>
          </ul>
        `
      }
    ]
  },
  {
    title: 'Identifying and Addressing Toxicity in AI',
    lessons: [
      {
        title: 'Introduction to Toxicity in AI',
        content: `
          <h2>Definition</h2>
          <br></br>
          <p>Explain that AI toxicity refers to the generation of harmful, biased, or discriminatory content by AI systems. It's a critical issue with potential negative consequences.</p>
          <br></br>
          <h2>Examples</h2>
          <br></br>
          <p>Provide examples of AI-generated toxic content, such as hate speech, offensive language, or biased recommendations.</p>
          <br></br>
          <h2>Resources</h2>
          <br></br>
          <ul>
            <li><a href="https://www.partnershiponai.org/wp-content/uploads/2023/01/Partnership-on-AI-The-State-of-AI-Ethics-Report-January-2023.pdf">The State of AI Ethics Report</a></li>
            <li><a href="https://openai.com/blog/our-approach-to-safety/">OpenAI's Approach to Safety</a></li>
          </ul>
        `
      },
      {
        title: 'Identifying Toxic Content',
        content: `
          <h2>Techniques</h2>
          <br></br>
          <ul>
            <li><strong>Content Filtering</strong>: Use keyword lists, regular expressions, or machine learning classifiers to detect harmful content.</li>
            <li><strong>Toxicity Models</strong>: Employ pre-trained or custom-built models to assess the toxicity level of generated text.</li>
          </ul>
        `
      },
      {
        title: 'Mitigating and Addressing Toxicity',
        content: `
          <h2>Approaches</h2>
          <br></br>
          <ul>
            <li><strong>Training Data Bias Mitigation</strong>: Carefully curate training data to remove biases and harmful content.</li>
            <li><strong>Debiasing Techniques</strong>: Apply techniques to debias AI models and reduce their propensity to generate toxic output.</li>
            <li><strong>Toxicity Mitigation Models</strong>: Develop models specifically for identifying and filtering toxic content.</li>
            <li><strong>User Feedback and Reporting</strong>: Establish mechanisms for users to report toxic content and provide feedback.</li>
          </ul>
        `
      }
    ]
  } 

];
const Tutorials = () => {
    const [selectedTutorial, setSelectedTutorial] = useState('');
  
    const handleDropdownChange = (event) => {
      setSelectedTutorial(event.target.value);
      const element = document.getElementById(event.target.value);
  
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      } else {
        console.error('Element not found:', event.target.value);
      }
    };
  
    return (
      <div>
        <nav>
          <ul>
            {tutorials.map((tutorial, index) => (
              <li key={index}>
                <a href={`#${tutorial.title.replace(/\s+/g, '-').toLowerCase()}`}
                   onClick={(e) => {
                     e.preventDefault();
                     const element = document.getElementById(tutorial.title.replace(/\s+/g, '-').toLowerCase());
                     if (element) {
                       element.scrollIntoView({ behavior: 'smooth' });
                     }
                   }}
                >
                  {tutorial.title}
                </a>
              </li>
            ))}
          </ul>
        </nav>
        <div>
          {tutorials.map((tutorial, index) => (
            <div key={index} id={tutorial.title.replace(/\s+/g, '-').toLowerCase()} className="tutorial">
              <h1>{tutorial.title}</h1>
              {tutorial.lessons.map((lesson, lessonIndex) => (
                <div key={lessonIndex} className="lesson">
                  <h2>{lesson.title}</h2>
                  <div dangerouslySetInnerHTML={{ __html: lesson.content }} />
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    );
  };
  
  export default Tutorials;