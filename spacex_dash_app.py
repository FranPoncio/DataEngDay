"""
SpaceX Launch Records Dashboard — Plotly Dash app.

Interactive dashboard for the IBM Data Science Capstone. Requires
spacex_launch_dash.csv (provided by the course) in the same directory.
Run with: python spacex_dash_app.py
"""

import pandas as pd
import dash
from dash import html, dcc
from dash.dependencies import Input, Output
import plotly.express as px

spacex_df = pd.read_csv("spacex_launch_dash.csv")
max_payload = spacex_df["Payload Mass (kg)"].max()
min_payload = spacex_df["Payload Mass (kg)"].min()

app = dash.Dash(__name__)

launch_sites = [{"label": "All Sites", "value": "ALL"}] + [
    {"label": site, "value": site} for site in spacex_df["Launch Site"].unique()
]

app.layout = html.Div(
    children=[
        html.H1(
            "SpaceX Launch Records Dashboard",
            style={"textAlign": "center", "color": "#503D36", "font-size": 40},
        ),
        dcc.Dropdown(
            id="site-dropdown",
            options=launch_sites,
            value="ALL",
            placeholder="Select a Launch Site here",
            searchable=True,
        ),
        html.Br(),
        html.Div(dcc.Graph(id="success-pie-chart")),
        html.Br(),
        html.P("Payload range (Kg):"),
        dcc.RangeSlider(
            id="payload-slider",
            min=0,
            max=10000,
            step=1000,
            marks={0: "0", 2500: "2500", 5000: "5000", 7500: "7500", 10000: "10000"},
            value=[min_payload, max_payload],
        ),
        html.Div(dcc.Graph(id="success-payload-scatter-chart")),
    ]
)


@app.callback(
    Output(component_id="success-pie-chart", component_property="figure"),
    Input(component_id="site-dropdown", component_property="value"),
)
def get_pie_chart(entered_site):
    if entered_site == "ALL":
        fig = px.pie(
            spacex_df,
            values="class",
            names="Launch Site",
            title="Total Successful Launches by Site",
        )
    else:
        filtered_df = spacex_df[spacex_df["Launch Site"] == entered_site]
        counts = filtered_df["class"].value_counts().reset_index()
        counts.columns = ["class", "count"]
        fig = px.pie(
            counts,
            values="count",
            names="class",
            title=f"Total Success vs. Failure Launches for site {entered_site}",
        )
    return fig


@app.callback(
    Output(component_id="success-payload-scatter-chart", component_property="figure"),
    [
        Input(component_id="site-dropdown", component_property="value"),
        Input(component_id="payload-slider", component_property="value"),
    ],
)
def get_scatter_chart(entered_site, payload_range):
    low, high = payload_range
    mask = spacex_df["Payload Mass (kg)"].between(low, high)
    filtered_df = spacex_df[mask]
    if entered_site != "ALL":
        filtered_df = filtered_df[filtered_df["Launch Site"] == entered_site]
    fig = px.scatter(
        filtered_df,
        x="Payload Mass (kg)",
        y="class",
        color="Booster Version Category",
        title="Correlation between Payload and Success for "
        + ("all sites" if entered_site == "ALL" else entered_site),
    )
    return fig


if __name__ == "__main__":
    app.run_server()
