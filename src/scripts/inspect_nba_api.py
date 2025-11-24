from nba_api.stats.endpoints import leaguegamelog
import inspect

print("Inspecting LeagueGameLog.__init__ parameters:")
signature = inspect.signature(leaguegamelog.LeagueGameLog.__init__)
for name, param in signature.parameters.items():
    print(f"  {name}: {param.default}")

print("\nDocumentation:")
print(leaguegamelog.LeagueGameLog.__doc__)
