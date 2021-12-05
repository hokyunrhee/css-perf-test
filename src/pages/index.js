import Link from "next/link";

export default function Home() {
  return (
    <ul>
      <li>
        <Link href="/css">
          <a>Css</a>
        </Link>
      </li>
      <li>
        <Link href="/css-in-js">
          <a>Css-in-js</a>
        </Link>
      </li>
    </ul>
  );
}
