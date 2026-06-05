from __future__ import annotations

from dataclasses import dataclass
from typing import Literal


Difficulty = Literal["normal", "hard"]
PopulationStatus = Literal["stable", "overloaded", "extinct"]


@dataclass
class ModelParameters:
    difficulty: Difficulty = "normal"
    r: float = 0.42
    k: float = 900.0
    mu: float = 0.05
    g: float = 0.16
    delta: float = 0.035
    q: float = 0.0018
    effort: float = 145.0
    stock: float = 24.0
    price: float = 5.4
    effort_cost: float = 1.75
    stock_cost: float = 2.1
    predator_mortality: float = 0.19
    predator_growth: float = 0.00045
    predation: float = 0.00075
    min_predator_population: float = 8.0
    food_threshold: float = 20.0
    initial_juvenile: float = 160.0
    initial_adult: float = 430.0
    initial_predator: float = 24.0
    initial_capital: float = 1800.0
    dt: float = 1.0


@dataclass
class SimulationState:
    time: float = 0.0
    juvenile: float = 160.0
    adult: float = 430.0
    predator: float = 0.0
    harvest: float = 0.0
    profit: float = 0.0
    cash: float = 1800.0
    population_status: PopulationStatus = "stable"


def clamp(value: float, min_value: float, max_value: float) -> float:
    return min(max(value, min_value), max_value)


def enforce_fish_capacity(juvenile: float, adult: float, capacity: float) -> tuple[float, float, bool]:
    next_juvenile = max(0.0, juvenile)
    next_adult = max(0.0, adult)
    total_fish = next_juvenile + next_adult
    overloaded = False

    if total_fish > capacity:
        overloaded = True
        excess = total_fish - capacity
        survival_ratio = (total_fish - excess) / total_fish
        next_juvenile *= survival_ratio
        next_adult *= survival_ratio

    return next_juvenile, next_adult, overloaded


def get_population_status(juvenile: float, adult: float, overloaded: bool) -> PopulationStatus:
    total_fish = juvenile + adult
    if adult <= 0 or total_fish <= 0:
        return "extinct"
    if overloaded:
        return "overloaded"
    return "stable"


def create_initial_state(params: ModelParameters | None = None) -> SimulationState:
    params = params or ModelParameters()
    juvenile, adult, overloaded = enforce_fish_capacity(
        params.initial_juvenile,
        params.initial_adult,
        params.k,
    )
    predator = 0.0
    if params.difficulty == "hard":
        predator = clamp(params.initial_predator, 0.0, 550.0)
        if adult > params.food_threshold:
            predator = clamp(
                max(predator, params.min_predator_population),
                0.0,
                550.0,
            )

    return SimulationState(
        juvenile=juvenile,
        adult=adult,
        predator=predator,
        cash=params.initial_capital,
        population_status=get_population_status(juvenile, adult, overloaded),
    )


def normalize_initial_state(state: SimulationState, params: ModelParameters) -> SimulationState:
    juvenile, adult, overloaded = enforce_fish_capacity(
        state.juvenile,
        state.adult,
        params.k,
    )
    predator = 0.0
    if params.difficulty == "hard":
        predator = clamp(state.predator, 0.0, 550.0)
        if adult > params.food_threshold:
            predator = clamp(
                max(predator, params.min_predator_population),
                0.0,
                550.0,
            )

    return SimulationState(
        time=state.time,
        juvenile=juvenile,
        adult=adult,
        predator=predator,
        harvest=state.harvest,
        profit=state.profit,
        cash=state.cash,
        population_status=get_population_status(juvenile, adult, overloaded),
    )


def simulate_step(state: SimulationState, params: ModelParameters) -> SimulationState:
    """Run one simulation step.

    Normal mode:
        dJ/dt = rF(1 - F/K) - mu J - gJ + S
        dF/dt = gJ - H - delta F

    Hard mode:
        modified Lotka-Volterra predator-prey dynamics with a gameplay constraint.
        Predators can fully disappear only when adult fish fall to food_threshold or lower.
        dJ/dt = rF(1 - F/K) - mu J - gJ + S
        dF/dt = gJ - H - delta F - bFP
        dP/dt = -mP + dFP, with a gameplay constraint:
        predators stay above min_predator_population while F is above food_threshold.

    Economics:
        H = min(qEF, F)
        Profit = pH - cE - sS
        cash = previous_cash + Profit * dt
    """
    if state.population_status == "extinct":
        return state

    available_adult = max(0.0, state.adult)
    harvest = min(params.q * params.effort * available_adult, available_adult)
    reproduction = params.r * state.adult * (1 - state.adult / params.k)
    maturation = params.g * state.juvenile

    d_juvenile = reproduction - params.mu * state.juvenile - maturation + params.stock
    d_adult = maturation - harvest - params.delta * state.adult
    d_predator = 0.0

    if params.difficulty == "hard":
        predation_loss = params.predation * state.adult * state.predator
        d_adult -= predation_loss
        d_predator = (
            -params.predator_mortality * state.predator
            + params.predator_growth * state.adult * state.predator
        )

    next_juvenile, next_adult, overloaded = enforce_fish_capacity(
        state.juvenile + d_juvenile * params.dt,
        state.adult + d_adult * params.dt,
        params.k,
    )
    next_predator = 0.0
    if params.difficulty == "hard":
        next_predator = clamp(state.predator + d_predator * params.dt, 0.0, 550.0)
        if next_adult > params.food_threshold:
            next_predator = clamp(
                max(next_predator, params.min_predator_population),
                0.0,
                550.0,
            )

    profit = (
        params.price * harvest
        - params.effort_cost * params.effort
        - params.stock_cost * params.stock
    )
    population_status = get_population_status(next_juvenile, next_adult, overloaded)

    return SimulationState(
        time=state.time + params.dt,
        juvenile=next_juvenile,
        adult=next_adult,
        predator=next_predator,
        harvest=harvest,
        profit=profit,
        cash=state.cash + profit * params.dt,
        population_status=population_status,
    )


def run_simulation(
    params: ModelParameters | None = None,
    initial_state: SimulationState | None = None,
    months: int = 24,
) -> list[SimulationState]:
    params = params or ModelParameters()
    state = normalize_initial_state(initial_state, params) if initial_state else create_initial_state(params)
    history = [state]

    for _ in range(months):
        if state.population_status == "extinct":
            break
        state = simulate_step(state, params)
        history.append(state)

    return history


if __name__ == "__main__":
    parameters = ModelParameters(difficulty="hard", predator_mortality=0.19)
    initial = SimulationState(predator=24.0)

    for point in run_simulation(parameters, initial, months=12):
        print(
            f"month={point.time:.0f} "
            f"J={point.juvenile:.2f} "
            f"F={point.adult:.2f} "
            f"P={point.predator:.2f} "
            f"H={point.harvest:.2f} "
            f"profit={point.profit:.2f} "
            f"cash={point.cash:.2f} "
            f"status={point.population_status}"
        )
