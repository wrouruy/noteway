interface Props {
    name: string
}

export default function Greetings ({ name }: Props) {
    const date = new Date();
    const hours = date.getHours();
    let greet: string;

    if (hours >= 6 && hours <= 10)
        greet = 'good morning';
    else if (hours >= 11 && hours <= 19)
        greet = 'good afternoon';
    else if (hours >= 20 && hours <= 22)
        greet = 'good evening'
    else greet = 'good night'

    return <h1>{greet}, {name}!</h1>
}