# css-in-js의 성능 비용

> 🦄 Aggelos Arvanitakis의 [글](https://calendar.perfplanet.com/2019/the-unseen-performance-costs-of-css-in-js-in-react-apps/) 내용을 따라서 프로파일한 결과에 일부 내용을 추가하여 정리한 글입니다.

</br>

## TL;DR

계속해서 css-in-js 방식을 사용하세요. 다만 css-in-js의 비용을 무시할 수 없는 경우가 있으니 주의하세요.

</br>

## 배경

저는 리액트 어플리케이션을 만들면서 css-in-js 방식의 라이브러리들을 주로 사용하고 있습니다. 다른 스타일링 방법들보다 DX가 좋게 느껴지기 때문입니다. 어렴풋하게 css-in-js 방식이 css 파일을 별도로 작성하는 것보다 비교적 성능이 떨어진다는 것은 알고 있었지만 그 동안 그렇다할만큼 느리다는 경험을 해본적이 없었습니다.

하지만 이번에 진행하고 있는 프로젝트에서 특정 요소를 100개 이상 렌더링할때, 유난히 어플리케이션이 느려지는 경험을 했습니다. 어플리케이션을 프로파일링하고 관련 자료를 찾아보면서 css-in-js의 비용을 무시할 수 없는 경우가 있다는 것을 알게되었습니다. 이 글은 그에 대한 내용을 정리한 것입니다.

</br>

## 프로파일링

테스트를 진행하기 위해서 간단한 어플리케이션을 만들었습니다. 이 어플리케이션은 1개의 리렌더링 버튼과 50개의 "Hello World" 텍스트를 렌더합니다. 동일한 어플리케이션을 두가지 버전으로 만들었습니다.

`css-in-js`

```js
import React, { useState } from "react";
import styled from "@emotion/styled";

const StyledDiv = styled.div``;
const StyledButton = styled.button``;

export default function CssInJs() {
  const [, setCount] = useState(0);

  return (
    <React.Fragment>
      <StyledButton onClick={() => setCount((prev) => prev + 1)}>
        ForceUpdate
      </StyledButton>
      {Array.from({ length: 50 }).map((_, index) => (
        <StyledDiv key={index}>Hello World</StyledDiv>
      ))}
    </React.Fragment>
  );
}
```

`css`

```js
import React, { useState } from "react";

const NormalDiv = (props) => <div {...props} />;

export default function Css() {
  const [, setCount] = useState(0);

  return (
    <React.Fragment>
      <button onClick={() => setCount((prev) => prev + 1)}>ForceUpdate</button>
      {Array.from({ length: 50 }).map((_, index) => (
        <NormalDiv key={index}>Hello World</NormalDiv>
      ))}
    </React.Fragment>
  );
}
```

개발자 도구의 Elements 패널을 이용하여 Dom Tree를 확인할 수 있습니다. 두가지 버전의 동일한 Dom Tree를 갖습니다.

반면 React Tree는 좀 다릅니다. 각각의 React Tree는 아래의 이미지와 같습니다.

</br>

`styled.div`
![](https://s3.us-west-2.amazonaws.com/secure.notion-static.com/338b1de2-40b4-48d7-9112-ecc1f5f5eb3a/Untitled.png?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=AKIAT73L2G45EIPT3X45%2F20211206%2Fus-west-2%2Fs3%2Faws4_request&X-Amz-Date=20211206T125617Z&X-Amz-Expires=86400&X-Amz-Signature=dbfe57f0360cd58320cedb9e6d2af793ec4469ed57d5f610fdcb7fefa3bb1c13&X-Amz-SignedHeaders=host&response-content-disposition=filename%20%3D%22Untitled.png%22&x-id=GetObject)

`div`
![](https://s3.us-west-2.amazonaws.com/secure.notion-static.com/fd68b283-3ed5-4856-b93e-9141f652ff04/Untitled.png?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=AKIAT73L2G45EIPT3X45%2F20211206%2Fus-west-2%2Fs3%2Faws4_request&X-Amz-Date=20211206T130202Z&X-Amz-Expires=86400&X-Amz-Signature=78a6e4e97ea560797c0cc496deaeb7a4831ef58b4b5491076e530c1f1d1e1c34&X-Amz-SignedHeaders=host&response-content-disposition=filename%20%3D%22Untitled.png%22&x-id=GetObject)

`styled.div`의 React Tree에는 `div`에서는 볼수 없던 것들이 추가되었습니다. 우선 useContext hook을 사용해서 ThemeContext 값에 접근합니다. Noop이라는 컴포넌트도 볼 수 있습니다.

</br>

이번에는 Profiler를 이용해 성능을 측정했습니다. 각각 리렌더링 버튼을 10회씩 눌러 렌더링 시간을 수집했습니다.

</br>

`styled.div` **개발 모드 평균 5.5ms**
![](https://s3.us-west-2.amazonaws.com/secure.notion-static.com/d8dc7e72-ca04-4936-a7f1-956bc87362ac/Untitled.png?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=AKIAT73L2G45EIPT3X45%2F20211206%2Fus-west-2%2Fs3%2Faws4_request&X-Amz-Date=20211206T130328Z&X-Amz-Expires=86400&X-Amz-Signature=8891d2f7789091c6b21edee41f36901c6acb0a502d229c05879bfa360a0eeff7&X-Amz-SignedHeaders=host&response-content-disposition=filename%20%3D%22Untitled.png%22&x-id=GetObject)

`div 개발 모드` **평균 2.54ms**
![](https://s3.us-west-2.amazonaws.com/secure.notion-static.com/b086b783-8829-42fd-84fb-e9d879f30d13/Untitled.png?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=AKIAT73L2G45EIPT3X45%2F20211206%2Fus-west-2%2Fs3%2Faws4_request&X-Amz-Date=20211206T132811Z&X-Amz-Expires=86400&X-Amz-Signature=b01a9951c1021cc85778e520fe23aab058d7a534da1627b50c065ed2c8ecb36b&X-Amz-SignedHeaders=host&response-content-disposition=filename%20%3D%22Untitled.png%22&x-id=GetObject)

개발 모드에서 측정한 경우 `css-in-js` 방식일때 116% 더 많은 시간을 소요했습니다.

</br>

`styled.div 프로덕`션 모드 **평균 1.13ms**
![](https://s3.us-west-2.amazonaws.com/secure.notion-static.com/5b1ba762-a882-4274-a056-325753ec7eb0/Untitled.png?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=AKIAT73L2G45EIPT3X45%2F20211206%2Fus-west-2%2Fs3%2Faws4_request&X-Amz-Date=20211206T132916Z&X-Amz-Expires=86400&X-Amz-Signature=2a04b4987ec2090e29b3de95b8ead765a91071d597489889e90fe9e64617250f&X-Amz-SignedHeaders=host&response-content-disposition=filename%20%3D%22Untitled.png%22&x-id=GetObject)

`div 프로덕션 모드` **평균 0.47ms**

![](https://s3.us-west-2.amazonaws.com/secure.notion-static.com/f532eb50-01d0-4134-aa21-e8267835ff10/Untitled.png?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=AKIAT73L2G45EIPT3X45%2F20211206%2Fus-west-2%2Fs3%2Faws4_request&X-Amz-Date=20211206T133000Z&X-Amz-Expires=86400&X-Amz-Signature=30e9c0146e4f12a4f2f2f1ce6adc2cc16303424fa0257cb8fa0c83250441e865&X-Amz-SignedHeaders=host&response-content-disposition=filename%20%3D%22Untitled.png%22&x-id=GetObject)

프로덕션 모드에서 측정한 경우 `css-in-js` 방식일때 140% 더 많은 시간을 소요했습니다.

</br>

element의 개수가 적을 때는 두가지 방식의 렌더링 시간 차이가 미세합니다. 하지만 개수가 증가함에 따라서 그 차이가 점점 증가하여 무시하지 못하는 시점이 발생합니다. 디바이스의 성능이 낮을 수록 이 차이는 빠르게 증가합니다. 60fps를 목표로 할 때, 화면을 업데이트하는데 16ms 보다 많은 시간이 소요되기 시작하면 지연이 일어나고 있는 것입니다.

`css-in-js` 방식이 느린 이유를 알아보기 위해서 `@emotion/styled`의 코드를 살펴보았습니다.

</br>

## 런타임 분석

리액트 컴포넌트가 렌더링 될 때, `@emotion/styled`는 다음의 일 등을 합니다.

1. [useContext hook을 사용해서 ThemeContext 값에 접근합니다.](https://github.com/emotion-js/emotion/blob/26ded6109fcd8ca9875cc2ce4564fee678a3f3c5/packages/styled/src/base.js#L86)
2. [className prop](https://github.com/emotion-js/emotion/blob/main/packages/styled/src/base.js#L90-L94)과 [Styled 함수 내부에서 만들어지는 name 값](https://github.com/emotion-js/emotion/blob/main/packages/styled/src/base.js#L99-L103)을 [합하여 컴포넌트의 className을 만듭니다.](https://github.com/emotion-js/emotion/blob/26ded6109fcd8ca9875cc2ce4564fee678a3f3c5/packages/styled/src/base.js#L109)
3. [입력 받은 스타일 속성들을 이용해서 \<style\>을 만들고 \<head\>에 추가합니다.](https://github.com/emotion-js/emotion/blob/main/packages/styled/src/base.js#L104-L108)

이러한 과정이 런타임에 발생하기 때문에 `css-in-js` 방식이 `css` 파일을 별도로 작성하는 방식에 비해서 렌더링 시간이 더 소요합니다. 라이브러리 마다 차이는 있지만 `runtime-based`의 `css-in-js` 라이브러리는 대략적으로 다 비슷합니다. 이러한 문제점을 해결하기 위해 [linaria](https://github.com/callstack/linaria)와 같은 `build time extraction`을 제공하는 `css-in-js` 라이브러리도 있습니다.

</br>

## 결론

`css-in-js` 방식의 라이브러리를 사용하고 있고 아직 아무런 문제가 없다면 계속 사용하면 됩니다. 대부분의 어플리케이션은 문제를 겪을 일이 없습니다. 다만 **다수의 컴포넌트를 마운트하거나 동적으로 스타일을 변경할 때**, 버벅거리는 문제를 겪고 있다면 다른 대안을 검토할 때입니다.

</br>

## 참고 자료

- [The unseen performance costs of modern CSS-in-JS libraries in React apps](https://calendar.perfplanet.com/2019/the-unseen-performance-costs-of-css-in-js-in-react-apps/)
- [CSS-in-JS Performance Cost - Mitigating Strategies](https://www.infoq.com/news/2020/01/css-cssinjs-performance-cost/)
- [The tradeoffs of CSS-in-JS](https://www.freecodecamp.org/news/the-tradeoffs-of-css-in-js-bee5cf926fdb/)
- [What actually is CSS-in-JS?](https://medium.com/dailyjs/what-is-actually-css-in-js-f2f529a2757)
