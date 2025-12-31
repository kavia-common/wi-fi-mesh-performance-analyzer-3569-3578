import { render, screen } from "@testing-library/react";
import App from "./App";

test("renders dashboard shell", () => {
  render(<App />);
  const title = screen.getByText(/Wi‑Fi Mesh Performance/i);
  expect(title).toBeInTheDocument();
});
