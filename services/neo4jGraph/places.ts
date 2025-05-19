import { initializeNeo4j } from "@/utils/server-clients";
import "server-only"

const getNeo4jPlace = async (placeId: string) => {
    const neo4j = await initializeNeo4j();
    const result = await neo4j.query(
        'MATCH (p:Place {id: $placeId}) RETURN p',
        { placeId }
    );

    return result
}


type InsertPlaceProps = {
    placeId: string;
    name?: string;
    cityId: string;
    latitude?: number;
    longitude?: number;
}
const insertNeo4jPlace = async (props: InsertPlaceProps) => {
    const neo4j = await initializeNeo4j();
    await neo4j.query(
        `
            CREATE(p: Place { id: $place, name: $name, coordinates: $coordinates })
            WITH p
            MATCH(c: City { id: $city })
            CREATE(p) - [: LOCATED_IN] -> (c)
            RETURN p
        `,
        {
            place: props.placeId,
            name: props.name,
            city: props.cityId,
            latitude: props.latitude,
            longitude: props.longitude,
        }
    );
}

export { getNeo4jPlace, insertNeo4jPlace }