# Interview AI

Interview AI is an AI-powered platform designed to generate custom interview rounds and provide personalized feedback, helping candidates effectively prepare for job interviews. The platform adapts to any job role and creates realistic multi-round interviews tailored to specific needs.

## Features

- **Custom Interview Generation**: Generate interview questions based on job title, company, and experience level.
- **Multi-Round Interviews**: Includes MCQ, coding, system design, and HR rounds.
- **Real-Time Guidance**: Solve technical problems and answer questions with real-time guidance.
- **Personalized Feedback**: Receive detailed analysis and actionable suggestions for improvement.

## Project Structure

```
.
├── .gitignore
├── bun.lockb
├── components.json
├── eslint.config.js
├── index.html
├── package.json
├── postcss.config.js
├── README.md
├── tailwind.config.ts
├── tsconfig.app.json
├── tsconfig.json
├── tsconfig.node.json
├── vite.config.ts
├── public/
│   ├── favicon.ico
│   ├── og-image.png
│   └── placeholder.svg
├── src/
│   ├── App.css
│   ├── App.tsx
│   ├── index.css
│   ├── main.tsx
│   ├── vite-env.d.ts
│   ├── components/
│   │   ├── Button.tsx
│   │   ├── DarkModeToggle.tsx
│   │   └── ui/
│   ├── hooks/
│   │   ├── use-mobile.tsx
│   │   └── use-toast.ts
│   ├── lib/
│   │   └── utils.ts
│   ├── pages/
│   │   ├── ApiKey.tsx
│   │   ├── Coding.tsx
│   │   ├── HR.tsx
│   │   ├── Index.tsx
│   │   ├── MCQ.tsx
│   │   ├── NotFound.tsx
│   │   ├── Results.tsx
│   │   ├── Setup.tsx
│   │   └── SystemDesign.tsx
│   └── utils/
│       ├── geminiAPI.ts
│       └── localStorage.ts
```

## Installation

1. Clone the repository:

   ```sh
   git clone https://github.com/methreamarnath1/interview-ai.git
   cd interview-ai
   ```

2. Install dependencies:

   ```sh
   npm install
   ```

3. Start the development server:
   ```sh
   npm run dev
   ```

## Usage

1. Open your browser and navigate to `http://localhost:3000`.
2. Follow the on-screen instructions to set up your interview preferences.
3. Complete the interview rounds and receive feedback.

## Contributing

Contributions are welcome! To contribute:

1. Fork the repository.
2. Create a new branch:
   ```sh
   git checkout -b feature-branch
   ```
3. Make your changes.
4. Commit your changes:
   ```sh
   git commit -m 'Add new feature'
   ```
5. Push the changes:
   ```sh
   git push origin feature-branch
   ```
6. Open a pull request.

## License

This project is licensed under the MIT License. See the LICENSE file for details

## Acknowledgements

Interviewify AI is built using:

- [React](https://reactjs.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Vite](https://vitejs.dev/)
- [clsx](https://github.com/lukeed/clsx)
- [tailwind-merge](https://github.com/dcastil/tailwind-merge)
- [Sonner](https://github.com/emilkowalski/sonner)

## Contact

For inquiries, please reach out at [mailto:methreamarnath@gmail.com].
