function randomcitation() {
    var cars = ["La vie est trop courte pour passer du temps avec des gens qui ne sont pas ingenieux.-jeff bezoz",
        "Je pense que cest le meilleur conseil : reflechissez constamment a la facon dont vous pourriez mieux faire les choses, et vous remettre en question. Elon Musk",
        "Une regle simple pour vraiment changer les choses, cest de commencer toujours par le plus simple, et non par le plus difficile. Parce que cest la meilleure maniere de progresser rapidement Mark Zuckerberg"];
    var item = cars[Math.floor(Math.random() * cars.length)];
    document.getElementById("demo").innerHTML = item;
}
